import {readdir, rmdir} from "./utils/fs";

(async () => {
   const files = await readdir('/opt/1win/1wintv-media/');

   for (let i = 0; i < files.length; i++) {
       if (['status.json', '1.txt'].includes(files[i])) continue;

       const content = await readdir(`/opt/1win/1wintv-media/${files[i]}`);

       if (content.length === 0) {
           await rmdir(`/opt/1win/1wintv-media/${files[i]}`);
       }

   }
})();
