export function getEnv() {

    return {
      REACT_APP_SEWASEW_API_BASE: process.env.REACT_APP_SEWASEW_API_BASE as string,
    };
  }
  
  type ENV = ReturnType<typeof getEnv>;
  
  declare global {
    // eslint-disable-next-line
    var ENV: ENV;
    interface Window {
      ENV: ENV;
    }
  }