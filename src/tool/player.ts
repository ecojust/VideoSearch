export default class Player {
  static m3u8Parser(m3u8: string) {
    const url = `https://m3u8player.org/player.html?url=${m3u8}`;
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.style.border = "none";
    iframe.style.position = "absolute";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    return iframe;
  }

  static async waitForElement(
    selector: string,
    timeout: number = 10000
  ): Promise<boolean> {
    const startTime = Date.now();
    return new Promise<boolean>((resolve, reject) => {
      const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(interval);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(false);
        }
      });
    });
  }
}
