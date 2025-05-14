import axios from 'axios';

declare const api: typeof axios;
export const fetchCSRFToken: () => Promise<string | null>;
export const checkServerStatus: () => Promise<boolean>;
export default api; 