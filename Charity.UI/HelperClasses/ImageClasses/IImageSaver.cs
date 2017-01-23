using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Charity.UI.HelperClasses
{
    interface IImageSaver
    {
        string GetRandomImageName();
        bool CheckExistsFileName(string FileName, string Path);
        void CheckPath(string SubPath);
        string SaveInDir(byte[] ByteArray, string fileName, string SubPath);
        string SaveImage(byte[] ByteArray, string fileName, string SubPath);
    }
}
