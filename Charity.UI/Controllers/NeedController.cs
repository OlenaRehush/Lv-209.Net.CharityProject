using Charity.DAL;
using Charity.DAL.Enums;
using Charity.DAL.Models;
using Charity.Services.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Charity.UI.Controllers
{
    public class NeedController : ApiController
    {
        private IRepository<Need> _needRepository;
        private IRepository<Organization> _organizationRepository;
        private IRepository<ApplicationUser> _user;
        private IRepository<TypeOfNeed> _need;
        private IRepository<NeedRequest> _requestRepository;
        private IRepository<Media> _mediaRepository;
        public NeedController(
            IRepository<Need> needRepository,
            IRepository<Organization> organizationRepository,
            IRepository<ApplicationUser> user,
            IRepository<TypeOfNeed> need,
            IRepository<Media> media,
            IRepository<NeedRequest> requestRepository)
        {
            _needRepository = needRepository;
            _organizationRepository = organizationRepository;
            _user = user;
            _need = need;
            _mediaRepository = media;
            _requestRepository = requestRepository;
        }

        /// <summary>
        /// Creates new need
        /// </summary>
        /// <param name="item">Contain data about new need</param>
        /// <returns>Status of add</returns>
        [HttpPost]
        [Authorize(Roles = "Organization")]
        public bool CreateNewNeed(Need item)
        {
            _needRepository.Create(item);
            _needRepository.Save();
            return true;
        }

        /// <summary>
        /// Tranform enum state to string value
        /// </summary>
        /// <param name="state">Contains state parameter</param>
        /// <returns>String value of state</returns>
        public string State(State state)
        {
            string result = string.Empty;
            switch (state)
            {
                case Charity.DAL.Enums.State.Passive: { result = "Виконано"; break; }
                case Charity.DAL.Enums.State.Active: { result = "Не виконано"; break; }
                case Charity.DAL.Enums.State.Canceled: { result = "Відмінено"; break; }
                case Charity.DAL.Enums.State.InProgress: { result = "Виконується"; break; }
            }
            return result;
        }

        /// <summary>
        /// Gets infromation about all needs
        /// </summary>
        /// <returns>Returns an <see cref="IEnumerable{NeedDTO}">IEnumerable&lt;NeedDTO&gt;</see> with all needs</returns>
        [Route("api/needs/allneeds")]
        [ActionName("GetAll")]
        public async Task<IEnumerable<NeedDTO>> GetAllNeeds()
        {
            var needs = await Task.Run(() => _needRepository.GetAll().ToList().Select(x => new NeedDTO()
            {
                Id = x.Id,
                Name = x.Name,
                Status = State(x.State),
                DateCreated = x.DateCreated,
                DateEnd = x.DateEnd,
                Organization = x.User.FullName,
                OrganizationId = x.User.Id,
                TypeOfNeed = x.TypeOfNeed.Type,
                UserId = x.NeedRequests != null ?
                (
                    x.NeedRequests.Where(c => c.Status == true).Count() != 0 ? (int?)x.NeedRequests.Where(c => c.Status == true).First().User.Id : null
                ) : null,
                User = x.NeedRequests != null ? (
                x.NeedRequests.Where(c => c.Status == true).Count() != 0 ? x.NeedRequests.Where(c => c.Status == true).First().User.FullName : null
                ) : null,
                UserPhoneNumber = x.User.PhoneNumber,
                Description = x.Description,
                ImageLink = x.ImageLink,
            }).ToList());
            return needs;
        }

        /// <summary>
        /// Gets need by id with converted media list
        /// </summary>
        /// <param name="id">Id of need</param>
        /// <returns>NeedDTO that contains data about need</returns>
        [HttpGet]
        [Route("api/needs/getneed")]
        [ActionName("Get")]
        public async Task<NeedDTO> GetNeedById(int? id)
        {
            if (id == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Неправильний запит")
                };
                throw new HttpResponseException(message);
            }
            var need = await Task.Run(() => _needRepository.GetById(id.Value));
            if (need == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.NotFound)
                {
                    Content = new StringContent("Неправильний запит")
                };
                throw new HttpResponseException(message);
            }
            var resNeed = new NeedDTO()
            {
                Id = need.Id,
                Name = need.Name,
                Status = State(need.State),
                DateCreated = need.DateCreated,
                DateEnd = need.DateEnd,
                Organization = need.User.FullName,
                ImageLink = need.ImageLink,
                User = need.State == DAL.Enums.State.Passive ? need.NeedRequests.Where(x => x.Status).FirstOrDefault().User.FullName : null,
                UserPhoto = need.State == DAL.Enums.State.Passive ? need.NeedRequests.Where(x => x.Status).FirstOrDefault().User.PhotoURL : null,
                TypeOfNeed = need.TypeOfNeed.Type,
                Description = need.Description
            };

            resNeed.Photos = need.Media.Where(x => x.Type == MediaType.Image).Select(x => x.Data).ToList();
            resNeed.Videos = need.Media.Where(x => x.Type == MediaType.Video).Select(x => x.Data).ToList();
            if(need.Media.Where(x => x.Type == MediaType.Feedback).Select(x => x.Data).Count() != 0)
                resNeed.Feedback = need.Media.Where(x => x.Type == MediaType.Feedback).Select(x => x.Data).First();
            
            if (resNeed == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Потреб немає")
                };
                throw new HttpResponseException(message);
            }

            return resNeed;
        }

        /// <summary>
        /// Gets need by id
        /// </summary>
        /// <param name="id">Id of need</param>
        /// <returns>Information about need</returns>
        [HttpGet]
        [AllowAnonymous]
        [Route("api/neeD/{id}")]
        public Need GetNeedEditById(int? id)
        {
            if (id != null)
            {
                return _needRepository.Get(x => x.Id == id);
            }
            else
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Потреба не була знайдена")
                };
                throw new HttpResponseException(message);
            }
        }

        /// <summary>
        /// Adds new need
        /// Adds media part of new need
        /// </summary>
        /// <param name="id">Id of new need</param>
        [HttpDelete]
        [Route("api/needs/{id}")]
        [AcceptVerbs("POST")]
        public void DeleteNeedById(int? id)
        {
            if (id != null)
            {
                
                _requestRepository.Delete(x => x.Need.Id == id);
                _mediaRepository.Delete(x => x.Need.Id == id);
                _needRepository.Delete(x => x.Id == id);
            }
            else
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Потреба не була знайдена")
                };
                throw new HttpResponseException(message);
            }
        }

        /// <summary>
        /// Updates information about need
        /// </summary>
        /// <param name="item">Contains updated infromation about need</param>
        [HttpPut]
        [Route("api/needs/updates")]
        public void UpdateNeed([FromBody]Need item)
        {
            if (item != null)
            {
                _needRepository.Update(item);
                _needRepository.Save();
            }
            else
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Потреба не була знайдена")
                };
                throw new HttpResponseException(message);
            }
        }

        /// <summary>
        /// Adds new need
        /// </summary>
        /// <param name="needObject">Contains data about new need</param>
        /// <returns>Status of add</returns>
        [HttpPost]
        [AllowAnonymous]
        [Route("api/Need/addNew")]
        public IHttpActionResult AddNeed(Need needObject)
        {
            try
            {
                _needRepository.Create(needObject);
                _needRepository.Save();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return Ok();
        }

        /// <summary>
        /// Gets type of need by id
        /// </summary>
        /// <param name="id">Id of type of need</param>
        /// <returns>Infromation about type of need</returns>
        [HttpGet]
        [AllowAnonymous]
        [Route("api/TypeOfNeed/{id}")]
        public TypeOfNeed GetTypeOfNeed(int? id)
        {
            if (id != null)
            {
                return _need.Get(x => x.Id == id);
            }
            else
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Тип потреби не був знайдений")
                };
                throw new HttpResponseException(message);
            }
        }
    }
}
