import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import AdminPanel from "./AdminPanel"; 

// ✅ Assign `withAuthenticator(AdminPanel)` to a named constant
const AppWithAuth = withAuthenticator(AdminPanel);

export default AppWithAuth; 