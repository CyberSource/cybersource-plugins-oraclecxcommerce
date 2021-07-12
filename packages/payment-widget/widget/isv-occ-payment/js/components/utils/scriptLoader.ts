declare global {
  interface Window {
    require: (modules: string[], callback: (module: any) => void) => void;
    [key: string]: any;
  }
}

export default function loadScript(url: string) {
  return new Promise<void>((resolve, reject) => {
    const scriptToLoad = document.createElement('script');
    scriptToLoad.setAttribute('src', url);
    scriptToLoad.onload = () => resolve();
    scriptToLoad.onerror = () => reject();
    document.body.appendChild(scriptToLoad);
  });
}

const isAmd = () => 'function' == typeof window.require;

export async function amdJsLoad<T>(url: string, globalEnvName: string): Promise<T> {
  if (isAmd()) {
    return new Promise<T>((resolve, reject) => {
      try {
        window.require([url], function (module) {
          resolve(<T>module);

          // Reassigning AMD exported module as global variable
          window[globalEnvName] = module[globalEnvName];
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  await loadScript(url);

  return <T>window[globalEnvName];
}
