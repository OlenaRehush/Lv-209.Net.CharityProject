using Charity.UI.Extensions;
using Charity.UI.HelperClasses.ImageClasses;
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Charity.UI.Controllers
{
    [RoutePrefix("api")]
    public class FileUploadController : ApiController
    {
        const string PathToImages = @"/Resources/images/";
        [Route("upload")]
        [HttpPost]
        /// <summary>
        /// Upload a new image on server
        /// </summary>
        /// <param name="request">Contains data from angular controller with image and information about it</param>
        /// <returns>Response with URL on the image</returns>
        public async Task<HttpResponseMessage> UploadFileAsync(HttpRequestMessage request)
        {
            if (!request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }
            var data = await Request.Content.ParseMultipartAsync();
            if (data == null)
            {
                throw new HttpResponseException(HttpStatusCode.NoContent);
            }
            var imageSaver = new ImageSaver();
            string URL = string.Empty;
            foreach (var item in data.Files)
            {
                var file = item.Value.File;
                switch (item.Value.Name)
                {
                    case "Need": URL = imageSaver.SaveImage(file, @"/Resources/images/content/needs/"); break;
                    case "NeedReport": URL = imageSaver.SaveImage(file,@"/Resources/images/content/needsreports/"); break;
                    case "User": URL = imageSaver.SaveImage(file, @"/Resources/images/content/users/", data.Fields["Id"].Value);  break;
                    case "Resource": URL = imageSaver.SaveImage(file,@"/Resources/images/content/resources/"); break;
                    default: throw new HttpResponseException(HttpStatusCode.NotAcceptable);
                }  
            }
            if (URL == string.Empty)
            {
                return new HttpResponseMessage(HttpStatusCode.BadRequest);
            }
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(URL)
            };
        }
    }
}
