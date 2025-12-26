import fs from 'fs/promises';
import fileTypePkg from 'file-type';
const { fileTypeFromFile } = fileTypePkg;
import { deleteFile } from './upload.js';

/**
 * File Type Validation Middleware with Magic Number Verification
 * 
 * This middleware validates uploaded files by:
 * 1. Checking MIME type from Content-Type header
 * 2. Verifying file extension
 * 3. Reading file magic numbers (first bytes) to confirm actual file type
 * 
 * This prevents malicious files disguised as valid documents
 */

// Allowed file types with their magic numbers
const ALLOWED_TYPES = {
  pdf: {
    mimeType: 'application/pdf',
    extensions: ['.pdf'],
    magicNumbers: ['25504446'] // %PDF in hex
  },
  docx: {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
    magicNumbers: ['504b0304'] // ZIP archive (DOCX is a ZIP)
  },
  doc: {
    mimeType: 'application/msword',
    extensions: ['.doc'],
    magicNumbers: ['d0cf11e0'] // Microsoft Office compound file
  }
};

/**
 * Read first 4 bytes of file to check magic numbers
 */
const readMagicNumber = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    // Get first 4 bytes
    const magicNumber = buffer.slice(0, 4).toString('hex');
    return magicNumber;
  } catch (error) {
    throw new Error('Failed to read file magic numbers');
  }
};

/**
 * Validate file type using magic numbers
 */
const validateFileType = async (filePath, declaredMimeType) => {
  // Get file type using file-type library (reads magic numbers)
  const fileType = await fileTypeFromFile(filePath);
  
  // Additional manual magic number check
  const magicNumber = await readMagicNumber(filePath);
  
  // Check if file type matches any allowed types
  for (const [type, config] of Object.entries(ALLOWED_TYPES)) {
    // Check magic numbers
    const magicMatches = config.magicNumbers.some(magic => 
      magicNumber.startsWith(magic)
    );
    
    if (magicMatches) {
      // For DOCX files, verify it's actually a valid DOCX by checking ZIP structure
      if (type === 'docx') {
        if (fileType?.mime === 'application/zip' || magicMatches) {
          return { valid: true, type };
        }
      }
      
      // For PDF and DOC files
      if (type === 'pdf' && fileType?.mime === 'application/pdf') {
        return { valid: true, type };
      }
      
      if (type === 'doc' && magicMatches) {
        return { valid: true, type };
      }
    }
  }
  
  return { valid: false, type: null };
};

/**
 * Express middleware to validate uploaded file
 * Use after multer upload middleware
 */
export const validateUploadedFile = async (req, res, next) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        statusCode: 400
      });
    }

    const { path: filePath, mimetype, originalname } = req.file;
    
    // Validate file type using magic numbers
    const validation = await validateFileType(filePath, mimetype);
    
    if (!validation.valid) {
      // Delete the invalid file
      await deleteFile(filePath);
      
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. The file content does not match allowed types (PDF, DOC, DOCX). File may be corrupted or disguised as a valid document.',
        statusCode: 400
      });
    }
    
    // Add validated file type to request
    req.validatedFileType = validation.type;
    
    next();
  } catch (error) {
    // Clean up file on error
    if (req.file?.path) {
      await deleteFile(req.file.path).catch(() => {});
    }
    
    return res.status(500).json({
      success: false,
      error: 'File validation failed',
      statusCode: 500
    });
  }
};

/**
 * Validate multiple uploaded files
 * Use after multer upload.array middleware
 */
export const validateUploadedFiles = async (req, res, next) => {
  try {
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
        statusCode: 400
      });
    }

    const validatedFiles = [];
    const invalidFiles = [];
    
    // Validate each file
    for (const file of req.files) {
      const validation = await validateFileType(file.path, file.mimetype);
      
      if (validation.valid) {
        validatedFiles.push({
          ...file,
          validatedType: validation.type
        });
      } else {
        invalidFiles.push(file.originalname);
        // Delete invalid file
        await deleteFile(file.path);
      }
    }
    
    // If any files are invalid, return error
    if (invalidFiles.length > 0) {
      // Clean up all files
      for (const file of validatedFiles) {
        await deleteFile(file.path);
      }
      
      return res.status(400).json({
        success: false,
        error: `Invalid file types detected: ${invalidFiles.join(', ')}. Only PDF, DOC, and DOCX files are allowed.`,
        statusCode: 400
      });
    }
    
    // Replace req.files with validated files
    req.files = validatedFiles;
    
    next();
  } catch (error) {
    // Clean up files on error
    if (req.files) {
      for (const file of req.files) {
        await deleteFile(file.path).catch(() => {});
      }
    }
    
    return res.status(500).json({
      success: false,
      error: 'File validation failed',
      statusCode: 500
    });
  }
};

/**
 * Check if file size is within limits
 * Additional validation beyond multer limits
 */
export const validateFileSize = (maxSizeMB = 10) => {
  return (req, res, next) => {
    if (req.file && req.file.size > maxSizeMB * 1024 * 1024) {
      deleteFile(req.file.path).catch(() => {});
      
      return res.status(400).json({
        success: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
        statusCode: 400
      });
    }
    
    if (req.files) {
      for (const file of req.files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          req.files.forEach(f => deleteFile(f.path).catch(() => {}));
          
          return res.status(400).json({
            success: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
            statusCode: 400
          });
        }
      }
    }
    
    next();
  };
};

export default {
  validateUploadedFile,
  validateUploadedFiles,
  validateFileSize
};
