using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.ExceptionHandling;
using System.Web.Http.Results;

namespace Charity.UI.HelperClasses
{
    public class GlobalExceptionHandler : ExceptionHandler
    { 
        /// <summary>
      /// Handle all exception in project, write information about it in Log file and throw response with error 500
      /// </summary>
      /// <param name="context">Contains data about exception</param>
        public override void Handle(ExceptionHandlerContext context)
        {
            log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
            log.Error(context.Exception.ToString());
            string errorMessage = context.Exception.Message;
            var response = context.Request.CreateResponse(HttpStatusCode.InternalServerError,
                new
                {
                    Message = errorMessage
                });
            context.Result = new ResponseMessageResult(response);
        }
    }
}