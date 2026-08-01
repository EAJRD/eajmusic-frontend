import React from 'react';
import { Navigate } from 'react-router';

// Password reset is now code-based (InsForge) and handled entirely on the
// Forgot Password page (enter email -> enter code + new password on the
// same page) - there's no longer a separate link-based reset step to land
// on here. Kept as a redirect in case an old bookmark/email link still
// points at /reset-password.
const ResetPassword: React.FC = () => <Navigate to="/forgot-password" replace />;

export default ResetPassword;
