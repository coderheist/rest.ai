/**
 * Pagination middleware for list endpoints
 * Adds pagination parameters to req.pagination
 */
export const paginate = (defaultLimit = 20, maxLimit = 100) => {
  return (req, res, next) => {
    // Get pagination parameters from query
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(req.query.limit) || defaultLimit)
    );
    
    // Calculate skip value
    const skip = (page - 1) * limit;
    
    // Add to request object
    req.pagination = {
      page,
      limit,
      skip
    };
    
    next();
  };
};

/**
 * Format paginated response
 * @param {Array} data - Array of results
 * @param {Number} total - Total count of documents
 * @param {Object} pagination - Pagination info from req.pagination
 * @returns {Object} Formatted response
 */
export const formatPaginatedResponse = (data, total, pagination) => {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
};

/**
 * Add sorting to query
 * @param {Object} query - Mongoose query object
 * @param {String} sortField - Field to sort by
 * @param {String} sortOrder - 'asc' or 'desc'
 * @returns {Object} Query with sorting applied
 */
export const addSort = (query, sortField = 'createdAt', sortOrder = 'desc') => {
  const sortOptions = {};
  sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
  return query.sort(sortOptions);
};

/**
 * Apply field selection to query (for lean queries)
 * @param {Object} query - Mongoose query object
 * @param {String} fields - Comma-separated field names
 * @returns {Object} Query with field selection applied
 */
export const selectFields = (query, fields) => {
  if (fields) {
    const selectedFields = fields.split(',').join(' ');
    return query.select(selectedFields);
  }
  return query;
};

/**
 * Combined pagination and sorting middleware
 */
export const paginateAndSort = (defaultLimit = 20, maxLimit = 100) => {
  return (req, res, next) => {
    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(req.query.limit) || defaultLimit)
    );
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Field selection
    const fields = req.query.fields;
    
    // Add to request object
    req.pagination = {
      page,
      limit,
      skip,
      sortField,
      sortOrder,
      fields
    };
    
    next();
  };
};

/**
 * Apply pagination and sorting to a Mongoose query
 * @param {Object} query - Mongoose query
 * @param {Object} pagination - Pagination config from req.pagination
 * @returns {Object} Configured query
 */
export const applyPagination = (query, pagination) => {
  const { skip, limit, sortField, sortOrder, fields } = pagination;
  
  // Apply sorting
  if (sortField && sortOrder) {
    const sortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    query = query.sort(sortOptions);
  }
  
  // Apply pagination
  query = query.skip(skip).limit(limit);
  
  // Apply field selection
  if (fields) {
    const selectedFields = fields.split(',').join(' ');
    query = query.select(selectedFields);
  }
  
  return query;
};

export default {
  paginate,
  paginateAndSort,
  formatPaginatedResponse,
  addSort,
  selectFields,
  applyPagination
};
