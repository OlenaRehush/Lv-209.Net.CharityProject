using Charity.DAL;
using Charity.DAL.Models;
using Charity.Services.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using Microsoft.AspNet.Identity.Owin;
using System.Web.Http;
using Charity.Services;
using System.Threading.Tasks;

namespace Charity.UI.Controllers
{
    public class OrganizationController : ApiController
    {
        private IRepository<Organization> _organizationRepository;
        private IRepository<ApplicationUser> _userRepository;
        private IRepository<Need> _needRepository;
        private IRepository<NeedRequest> _requestRepository;
        private IRepository<TypeOfNeed> _typeOfNeedRepository;
        private IRepository<Media> _mediaRepository;
        private ApplicationUser _user;

        private ApplicationUser AppUser 
        {
            get
            {
                return _user == null ? _userRepository.Get(c => c.UserName == User.Identity.Name) : _user;
            }
        }

        public OrganizationController(
            IRepository<Media> mediaRepository, 
            IRepository<NeedRequest> needRequest, 
            IRepository<TypeOfNeed> typeOfNeedRepository, 
            IRepository<Need> needRepository, 
            IRepository<Organization> organizationRepository, 
            IRepository<ApplicationUser> userRepository)
        {
            _organizationRepository = organizationRepository;
            _userRepository = userRepository;
            _needRepository = needRepository;
            _typeOfNeedRepository = typeOfNeedRepository;
            _requestRepository = needRequest;
            _mediaRepository = mediaRepository;
        }

        /// <summary>
        /// Gets information about all organizations
        /// </summary>
        /// <returns>Returns an <see cref="IEnumerable{OrganizationDTO}">IEnumerable&lt;OrganizationDTO&gt;</see> with all organizations</returns>
        [HttpGet]
        [AllowAnonymous]
        [Route("api/organizations/allorganizations")]
        [ActionName("GetAll")]
        public IEnumerable<OrganizationDTO> GetAllOrganizations()
        {
            var _organizations = _organizationRepository.GetAll().Select(x => new OrganizationDTO()
            {
                Id = x.Id,
                Name = x.User.FullName,
                Longitude = x.Longitude,
                Latitude = x.Latitude,
                Address = x.User.Address,
                WebSite = x.User.WebSite,
                Description = x.User.Description
            });
            return _organizations;
        }

        /// <summary>
        /// Gets organization by id
        /// </summary>
        /// <param name="id">Id of organization</param>
        /// <returns>Returns an <see cref="IEnumerable{OrganizationDTO}">IEnumerable&lt;OrganizationDTO&gt;</see> with organizations by id</returns>
        [HttpGet]
        [Route("api/organizations/{id}")]
        public IEnumerable<OrganizationDTO> GetOrganizationById(int? id)
        {
            if (id == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Неправильний запит")
                };
                throw new HttpResponseException(message);
            }

            var _organizations = _organizationRepository.GetAll().Select(x => new OrganizationDTO()
            {
                Id = x.Id,
                Name = x.User.FullName,
                Longitude = x.Longitude,
                Latitude = x.Latitude,
                Address = x.User.Address,
                WebSite = x.User.WebSite,
                Description = x.User.Description
            }).Where(x => x.Id == id);

            if (_organizations == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("За вашим запитом, не було знайдено організацій")
                };
                throw new HttpResponseException(message);
            }

            return _organizations;
        }

        /// <summary>
        /// Updates information about organization
        /// </summary>
        /// <param name="item">Contains data about updated organization</param>
        [HttpPut]
        [Route("api/organizations/updates")]
        public void UpdateOrganization ([FromBody]Organization item)
        {
            if (item != null)
            {
                _organizationRepository.Update(item);
 
            }
            else
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Неправильний запит")
                };
                throw new HttpResponseException(message);
            }
        }


        /// <summary>
        /// Adds new need
        /// </summary>
        /// <param name="model">Contains data about new need</param>
        /// <returns>Status of add</returns>
        [Authorize(Roles = "Organization")]
        [Route("api/Organization/AddNeed")]
        [HttpPut]
        public IHttpActionResult Update(Need model)
        {
            IHttpActionResult result = Ok();

            if (model != null)
            {
                Need need = new Need()
                {
                    Name = model.Name,
                    DateEnd = model.DateEnd,
                    ImageLink = model.ImageLink,
                    TypeOfNeed = _typeOfNeedRepository.GetById(model.TypeOfNeed.Id),
                    Description = model.Description,
                    
                    DateCreated = DateTime.Now,
                    State = DAL.Enums.State.Active,
                    User = AppUser,
                };

                _needRepository.Create(need);
                _needRepository.Save();
            }
            else
            {
                result = BadRequest("Переданої моделі не існує");
            }

            return result;
        }

        /// <summary>
        /// Updates information about need.
        /// Delete need request with cancelled status.
        /// </summary>
        /// <param name="model">Contains updated data of need</param>
        /// <returns>Status of update </returns>
        [Authorize(Roles = "Organization")]
        [Route("api/Organization/EditNeed")]
        [HttpPut]
        public IHttpActionResult Edit(Need model)
        {
            IHttpActionResult result = Ok();

            if(model != null)
            {
                Need need = _needRepository.GetById(model.Id);

                if (need != null)
                {

                    need.TypeOfNeed = _typeOfNeedRepository.GetById(model.TypeOfNeed.Id);
                    need.User = AppUser;

                    need.Name = model.Name;
                    need.DateEnd = model.DateEnd;
                    need.Description = model.Description;
                    need.ImageLink = model.ImageLink;
                    need.State = model.State;

                    // if cancel need then delete all requests
                    if (need.State == DAL.Enums.State.Canceled)
                    {
                        need.DateEnd = DateTime.Now;

                        _requestRepository.Delete(c => c.Need.Id == need.Id);
                    }
                    _needRepository.Update(need);
                    _needRepository.Save();
                }
                else
                {
                    result = BadRequest("Потреби в базі даних знайдено");
                }
            }
            else
            {
                result = BadRequest("Переданої моделі не існує");
            }

            return result;
        }

        /// <summary>
        /// Send feedback about need request.
        /// Updates need request and need status.
        /// Adds media part of feedback.
        /// </summary>
        /// <param name="feedback">Contains data about feedback</param>
        /// <returns>Status of update</returns>
        [Authorize(Roles = "Organization")]
        [Route("api/Organization/ConfirmNeed")]
        [HttpPut]
        public async Task<IHttpActionResult> Edit(FeedbackDTO feedback)
        {
            IHttpActionResult result = Ok();

            if (feedback != null)
            {
                Need need = _needRepository.GetById(feedback.NeedId);

                if (need != null)
                {
                    need.State = DAL.Enums.State.Passive;

                    feedback.Photos.Need = need;
                    feedback.Video.Need = need;
                    feedback.Feedback.Need = need;
                    _mediaRepository.Create(feedback.Photos);
                    _mediaRepository.Create(feedback.Video);
                    _mediaRepository.Create(feedback.Feedback);
                    _mediaRepository.Save();

                    string anonMessage = need.NeedRequests.Where(c => c.Status == true).FirstOrDefault().IsAnonymous ? "Ви побажали залишитись анонімом" : "";

                    // if confirm need then delete all not selected requests
                    if (need.State == DAL.Enums.State.Passive)
                    {
                        need.DateEnd = DateTime.Now;
                        _requestRepository.Delete(c => c.Status == false && c.Need.Id == need.Id);
                        // it needs if volunteer wish to stay anonymous 
                        _requestRepository.Delete(c => c.Status == true && c.Need.Id == need.Id && c.IsAnonymous == true);
                    }

                    _needRepository.Update(need);
                    _needRepository.Save();

                    ApplicationUser user = _userRepository.GetById(feedback.VolunteerId);
                    double sum = user.Rating + feedback.Grade;
                    if(sum > 0)
                    {
                        user.Rating = sum / 2;
                        _userRepository.Update(user);
                        _userRepository.Save();
                    }

                    var UserManager = Request.GetOwinContext().GetUserManager<ApplicationUserManager>();

                    string mailForUser =
                        "<h2>Соціальна карта відповідального міста</h2> <br/>" +
                        "<p>Організація <b> <a href=\"" + Request.Headers.Host + "/InfoPage/" + need.User.Id + "\">" +
                        need.User.FullName + "</a></b>, підтвердила що ви виконали потребу <b>" + need.Name + "</b>." +
                        "<br/><p><b>Відгук:</b></p>" +
                        "<p>" + feedback.Feedback.Data + "</p>" +
                        "<p>Також організаці оцінила вас на: <b>" + feedback.Grade + "</b> бали(ів)</p>" +
                        "<b>" + anonMessage + "</b>" +
                        "<p>Як це було, ви можете перейти на сторінку</p>" +
                        "<p>" + Request.Headers.Host + "/need/" + need.Id + "</p>" +
                        "<br/><p>З повагою адміністрація Соціальної карти відповідального міста!</p> ";

                    await UserManager.SendEmailAsync(user.Id, "Допомога організації", mailForUser);
                    
                }
                else
                {
                    result = BadRequest("Потреби в базі даних знайдено");
                }
            }
            else
            {
                result = BadRequest("Переданої моделі не отримано");
            }

            return result;
        }

        #region Get Request Count
        /// <summary>
        /// Gets information about number of need requests to organization
        /// </summary>
        /// <returns>Count of need requests</returns>
        [Authorize(Roles = "Organization")]
        [Route("api/Organization/RequestCount")]
        [HttpGet]
        public int RequestCount()
        {
            List<Need> needs = AppUser.Needs.Where(c => c.State == 0).ToList();
            int requestCount = 0;
            foreach (var need in needs)
            {
                if (need.NeedRequests != null)
                {
                    requestCount += need.NeedRequests.Count;
                }
            }

            return requestCount;
        }
        #endregion
        #region Get Information about Request 
        /// <summary>
        /// Gets information about  need requests  to organization
        /// </summary>
        /// <returns>Information about need requests </returns>
        [Authorize(Roles = "Organization")]
        [Route("api/Organization/RequestInfo")]
        [HttpGet]
        public List<NeedRequest> RequestInfo()
        {
            var userId = AppUser.Id;
            var allRequests = _requestRepository.GetAll().Where(c => c.Need.User.Id == userId).Where(c => c.Need.State == 0);
            if(allRequests.Count() != 0)
            {
                return allRequests.ToList();
            }
            else
            return new List<NeedRequest>();
        }
        #endregion
    }
}
