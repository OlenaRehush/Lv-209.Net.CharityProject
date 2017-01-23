using Charity.DAL;
using Charity.DAL.Models;
using Charity.Services.Models;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Charity.Services;

namespace Charity.UI.Controllers
{
    public class NeedRequestController : ApiController
    {
        private IRepository<NeedRequest> _needRequestRepository;
        private IRepository<ApplicationUser> _userRepository;
        private IRepository<Need> _needRepository;
        public NeedRequestController(
            IRepository<NeedRequest> needRequestRepository, 
            IRepository<ApplicationUser> userRepository, 
            IRepository<Need> needRepository)
        {
            _needRequestRepository = needRequestRepository;
            _userRepository = userRepository;
            _needRepository = needRepository;
        }

        /// <summary>
        /// Gets all need requests 
        /// </summary>
        /// <returns>Returns an <see cref="IEnumerable{NeedRequestDTO}">IEnumerable&lt;NeedRequestDTO&gt;</see> with all need requests</returns>
        [HttpGet]
        [Route("api/needRequests/allRequests")]
        [ActionName("GetAll")]
        public IEnumerable<NeedRequestDTO> GetAllNeedRequests()
        {
                var _needRequests = _needRequestRepository.GetAll().Select(x => new NeedRequestDTO()
                {
                    Id = x.Id,
                    Status = x.Status,
                    Date = x.Date,
                    Phone = x.Phone,
                    IsAnonymous = x.IsAnonymous,
                    Description= x.Description,
                    Need_Id= x.Need.Id,
                    User_Id=x.User.Id
                }).AsQueryable();

                if (_needRequests == null)
                {
                    var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                    {
                        Content = new StringContent("Не знайдено волонтерів за цим запитом")
                    };
                    throw new HttpResponseException(message);
                }

                return _needRequests;
        }


        /// <summary>
        /// Gets need request by id
        /// </summary>
        /// <param name="id"> Id of need request</param>
        /// <returns>NeedRequestDTO which contains data about need request</returns>
        [HttpGet]
        [Route("api/needRequests/{id}")]
        public NeedRequestDTO GetNeedEditById(int? id)
        {
            if (id == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Неправильний запит")
                };
                throw new HttpResponseException(message);
            }

            var _needRequests = _needRequestRepository.GetAll().Select(x => new NeedRequestDTO()
                {
                    Id = x.Id,
                    Status = x.Status,
                    Date = x.Date,
                    Phone = x.Phone,
                    IsAnonymous = x.IsAnonymous,
                    Description = x.Description,
                    Need_Id = x.Need.Id,
                    User_Id = x.User.Id
                }).FirstOrDefault(x => x.Id == id);
                if (_needRequests == null)
                {
                    var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                    {
                        Content = new StringContent("Не знайдено волонтерів за цим запитом")
                    };
                    throw new HttpResponseException(message);
                }

                return _needRequests;
        }

        /// <summary>
        /// Deletes need request by id 
        /// </summary>
        /// <param name="id"> Id of need request</param>
        [HttpDelete]
        [Route("api/needRequests/{id}")]
        [AcceptVerbs("POST")]
        public void DeleteNeedById(int? id)
        {
            if (id != null)
            {
                _needRequestRepository.Delete(x => x.Id == id);
                _needRequestRepository.Save();
            }
            else
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Видалення виконано не було")
                };
                throw new HttpResponseException(message);
            }
        }


        // Switch request in progress 
        /// <summary>
        /// Updates need request.
        /// Send email notification about confirmed/declined status of need request.
        /// </summary>
        /// <param name="item">Contains data about updated need request</param>
        /// <returns>Status of update</returns>
        [HttpPut]
        [Route("api/NeedRequest/Update")]
        public async Task<IHttpActionResult> UpdateRequestAsync(NeedRequest item)
        {
            IHttpActionResult result = Ok();
            
            if (item != null)
            {
                NeedRequest request = _needRequestRepository.GetById(item.Id);

                if (User.Identity.GetUserId<int>() == request.User.Id || request.User.Id == request.Need.User.Id)
                {
                    result = BadRequest("Ви не можете бути виконавцем власної потреби");
                }
                else
                {
                    var requests = _needRequestRepository.GetAll(c => c.Need.Id == request.Need.Id);
                    foreach (var unit in requests)
                        if (unit.Status == true)
                        {
                            unit.Status = false;
                            _needRequestRepository.Update(unit);
                        }

                    request.IsAnonymous = item.IsAnonymous;
                    request.Phone = item.Phone;
                    request.Status = item.Status;
                    request.Description = item.Description;
                    request.IsAnonymous = item.IsAnonymous;
                    if (request.Status == true)
                    {
                        request.Need.State = DAL.Enums.State.InProgress;
                    }
                    else
                    {
                        request.Need.State = DAL.Enums.State.Active;
                    }

                    _needRequestRepository.Update(request);
                    _needRequestRepository.Save();

                    _needRepository.Update(request.Need);
                    _needRepository.Save();

                    var UserManager = Request.GetOwinContext().GetUserManager<ApplicationUserManager>();

                    if (request.Status == true)
                    {
                        string mailForUser =
                            "<h2>Соціальна карта відповідального міста</h2> <br/>" +
                            "<p>Доброго дня!</p>" +
                            "<p>Організація <b> <a href=\"" + Request.Headers.Host + "/InfoPage/" + request.Need.User.Id + "\">" +
                            request.Need.User.FullName + "</a></b>, вибрала вас для виконання потреби <b>" + request.Need.Name + "</b>." +
                            "<br/><p>Контактні дані організації</p>" +
                            "<p><b>" + request.Need.User.Email + "</b></p>" +
                            "<p><b>" + request.Need.User.Address + "</b></p>" +
                            "<p><b>" + request.Need.User.PhoneNumber + "</b></p>" +
                            "<br/><p>Якщо у вас виникли якісь запитання, будь ласка, пишіть нам на нашу електронну пошту charity@gmail.com</p><br/>" +
                            "<p>Дякую!</p>" +
                            "<p>З повагою адміністрація Соціальної карти відповідального міста!</p> ";

                        await UserManager.SendEmailAsync(request.User.Id, "Допомога організації", mailForUser);
                    }

                    if (request.Status == false)
                    {
                        string mailForUser =
                            "<h2>Соціальна карта відповідального міста</h2> <br/>" +
                            "<p>Доброго дня!</p>" +
                            "<p>Організація <b> <a href=\"" + Request.Headers.Host + "/InfoPage/" + request.Need.User.Id + "\">" +
                            request.Need.User.FullName + "</a></b>, відмінила ваш процес виконання потреби <b>" + request.Need.Name + "</b>." +
                            "<br/><p>Контактні дані організації</p>" +
                            "<p><b>" + request.Need.User.Email + "</b></p>" +
                            "<p><b>" + request.Need.User.Address + "</b></p>" +
                            "<p><b>" + request.Need.User.PhoneNumber + "</b></p>" +
                            "<br/><p>Якщо у вас виникли якісь запитання, будь ласка, пишіть нам на нашу електронну пошту charity@gmail.com</p><br/>" +
                            "<p>Дякую!</p>" +
                            "<p>З повагою адміністрація Соціальної карти відповідального міста!</p> ";

                        await UserManager.SendEmailAsync(request.User.Id, "Допомога організації", mailForUser);
                    }
                }
            }
            else
            {
                result = BadRequest("Запит не виявлено");
            }

            return result;
        }

        /// <summary>
        /// Adds new need request.
        /// Send email notification about request of user.
        /// </summary>
        /// <param name="item">Contains data about new need request</param>
        /// <returns>Status of add</returns>
        [HttpPost]
        [Authorize]
        [Route("api/NeedRequest/Add")]
        public async Task<IHttpActionResult> AddRequestAsync(NeedRequest item)
        {
            IHttpActionResult result = Ok();
            int UserId = User.Identity.GetUserId<int>();

            if(item == null)
            {
                result = BadRequest("Потребу не виявлено");
            }
            else
            {
                if ((_needRequestRepository.GetAll().Where(c => c.Need.Id == item.Need.Id).Where(c => c.User.Id == UserId)).Count() == 0)
                { 
                    NeedRequest request = new NeedRequest()
                    {
                        Date = System.DateTime.Now,
                        IsAnonymous = item.IsAnonymous,
                        Phone = item.Phone,
                        Status = item.Status,
                        Description = item.Description,
                        Need = _needRepository.GetById(item.Need.Id),
                        User = _userRepository.GetById(UserId),
                    };

                    if (UserId == request.Need.User.Id)
                    {
                        result = BadRequest("Ви не може бути виконавцем власної потреби");
                    }
                    else
                    try
                    {
                        _needRequestRepository.Create(request);
                        _needRequestRepository.Save();

                        var UserManager = Request.GetOwinContext().GetUserManager<ApplicationUserManager>();
                        // Send email for user

                        string mailForUser = 
                            "<h2>Соціальна карта відповідального міста</h2> <br/>" +
                            "<p>Доброго дня!</p>" +
                            "<p>Дякую що ви намагаєтесь допомогти організації <b>" + request.Need.User.FullName +
                            "</b>, хочемо вас сповістити про те що організація отримала ваш запит про допомогу на потребу <b>" + request.Need.Name +"</b>, скоро організація вибере одного волонтера, та сповістить його про це." +
                            "<p>Якщо у вас виникли якісь запитання, будь ласка, пишіть нам на нашу електронну пошту charity@gmail.com</p> <br/>" +
                            "<p>Дякую!</p>" +
                            "<p>З повагою адміністрація Соціальної карти відповідального міста!</p> ";

                        await UserManager.SendEmailAsync(request.User.Id, "Допомога організації", mailForUser);

                        // Send email for Organization
                        string mailForOrg =
                            "<h2>Соціальна карта відповідального міста</h2> <br/>" +
                            "<p>Доброго дня!</p>" +
                            "<p>Волонтер на ім'я <b>" + request.User.FullName +"</b>, бажає вам допомогти на потребу \"<b>" + request.Need.Name +"</b>\", ви можете " +
                            "<a href=\"" +
                            Request.Headers.Host + "/profile" +
                            "\"</a>перейти на в ваш особистий кабінет</a> та продовжити операцію з потребою</p>" +
                            "<b>Повідомлення від волонтера</b>" +
                            "<p>" + request.Description + "</p>" +
                            "<b>Інформацію про волонтера</b>" +
                            "<p><b>" + request.User.Email + "</b>" +
                            "<p><b>" + request.Phone + "</b>" +
                            "<p>Рейтинг: <b>" + request.User.Rating + "</b><br/>" +
                            "<p>Якщо у вас виникли якісь запитання, будь ласка, пишіть нам на нашу електронну пошту charity@gmail.com</p> <br/>" +
                            "<p>Дякую!</p>" +
                            "<p>З повагою адміністрація Соціальної карти відповідального міста!</p> ";

                        await UserManager.SendEmailAsync(request.Need.User.Id, "Допомога організації", mailForOrg);

                    }

                    catch (System.Exception ex)
                    {
                        result = BadRequest(ex.Message);
                    }
                }
                else
                {
                    result = BadRequest("Ви вже надсилали запит на виконання цієї потреби");
                }
            }

            return result;
        }
    }
}
