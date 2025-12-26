import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified
        };
        setUser(userData);
        
        // Load tenant info from localStorage if available
        const savedTenant = localStorage.getItem('tenant');
        if (savedTenant) {
          setTenant(JSON.parse(savedTenant));
        }
      } else {
        // User is signed out
        setUser(null);
        setTenant(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });

      // Store tenant info in localStorage
      const tenantData = {
        name: userData.tenantName,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('tenant', JSON.stringify(tenantData));
      setTenant(tenantData);

      const newUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userData.name,
        emailVerified: userCredential.user.emailVerified
      };
      setUser(newUser);
      
      return { success: true };
    } catch (err) {
      let errorMessage = 'Registration failed';
      
      // Firebase error codes
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified
      };
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      let errorMessage = 'Login failed';
      
      // Firebase error codes
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('tenant');
      setUser(null);
      setTenant(null);
      setError(null);
      return { success: true };
    } catch (err) {
      const errorMessage = 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (err) {
      let errorMessage = 'Failed to send reset email';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, provider);
      
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        emailVerified: result.user.emailVerified,
        photoURL: result.user.photoURL
      };
      setUser(userData);

      // Create default tenant if not exists
      const savedTenant = localStorage.getItem('tenant');
      if (!savedTenant) {
        const tenantData = {
          name: result.user.displayName || 'My Company',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('tenant', JSON.stringify(tenantData));
        setTenant(tenantData);
      }
      
      return { success: true };
    } catch (err) {
      let errorMessage = 'Google sign-in failed';
      
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in popup was closed';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked by browser';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    tenant,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    signInWithGoogle,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
