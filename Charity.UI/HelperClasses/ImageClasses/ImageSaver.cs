using System;
using System.IO;
using System.Web;

namespace Charity.UI.HelperClasses.ImageClasses
{
    public class ImageSaver : IImageSaver
    {
        const string extension = ".jpg";
        /// <summary>
        /// Generate random name for image  
        /// </summary>
        /// <returns>Returns an <see cref="string">Random name</see></returns>
        public string GetRandomImageName()
        {
            return Path.ChangeExtension(Path.GetRandomFileName(),extension);
        }
        /// <summary>
        /// Check if the file with name which function GetRandomImageName generatod is exist in the folder
        /// </summary>
        /// <returns>Returns an <see cref="bool">true or false</see></returns>
        public bool CheckExistsFileName(string FileName, string Path)
        {
            return File.Exists(Path + FileName);
        }
        /// <summary>
        /// Check if the directory is created, if no it will do it
        /// </summary>
        public void CheckPath(string SubPath)
        {
            bool exists = Directory.Exists(HttpContext.Current.Server.MapPath(SubPath));
            if (!exists)
                Directory.CreateDirectory(HttpContext.Current.Server.MapPath(SubPath));
        }
        /// <summary>
        /// Save file in the folder and return URL on it
        /// </summary>
        /// <returns>Returns an <see cref="string">URL to file</see></returns>
        public string SaveInDir(byte[] ByteArray, string fileName,string SubPath)
        {
            using (var stream = new MemoryStream(ByteArray))
            {
                System.Drawing.Image newImage = System.Drawing.Image.FromStream(stream);
                var filePath = HttpContext.Current.Server.MapPath(SubPath + fileName);
                newImage.Save(filePath, System.Drawing.Imaging.ImageFormat.Jpeg);
                return HttpContext.Current.Request.Url.Scheme + "://" + HttpContext.Current.Request.Url.Authority + SubPath + fileName;
            }
        }
        /// <summary>
        /// Save file with checking way to file and file name of it.
        /// </summary>
        /// <returns>Returns an <see cref="string">URL to file</see></returns>
        public string SaveImage(byte[] ByteArray, string SubPath,string fileName = null)
        {
            CheckPath(SubPath);
            string FileName = ((fileName != null) ? fileName : string.Empty);
            if (FileName == string.Empty)
            {
                do
                {
                    FileName = GetRandomImageName();
                } while (CheckExistsFileName(FileName, SubPath));
            }
            return SaveInDir(ByteArray, FileName, SubPath);
        }
    }
}
