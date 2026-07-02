/**
 * Dynamically loads the Daum Postcode script if not already present,
 * and resolves with the window.daum.Postcode object.
 */
export function loadDaumPostcode() {
  return new Promise((resolve, reject) => {
    if (window.daum && window.daum.Postcode) {
      resolve(window.daum.Postcode);
      return;
    }

    const scriptId = 'daum-postcode-script';
    let script = document.getElementById(scriptId);

    if (script) {
      const handleLoad = () => {
        if (window.daum && window.daum.Postcode) {
          resolve(window.daum.Postcode);
        } else {
          reject(new Error('Daum Postcode object not found after script load'));
        }
        cleanup();
      };
      
      const handleError = (err) => {
        reject(err);
        cleanup();
      };

      const cleanup = () => {
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
      };

      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);
      return;
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;

    script.onload = () => {
      if (window.daum && window.daum.Postcode) {
        resolve(window.daum.Postcode);
      } else {
        reject(new Error('Daum Postcode object not found after script load'));
      }
    };

    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });
}
