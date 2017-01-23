using Charity.DAL;
using Charity.DAL.Models;
using Charity.Services.Models;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Charity.UI.Controllers
{
 
    public class SocialWorkerController : ApiController
    {
        private IRepository<SocialWorker> _socialWorkerRepository;
        private IRepository<SocialSphere> _socialSphereRepository;
        private IRepository<TypeOfSphere> _typeOfSphereRepository;

        public SocialWorkerController(
            IRepository<SocialWorker> socialWorkerRepository,
            IRepository<SocialSphere> socialSphereRepository, 
            IRepository<TypeOfSphere> typeOfSphereRepository)
        {
            _socialWorkerRepository = socialWorkerRepository;
            _socialSphereRepository = socialSphereRepository;
            _typeOfSphereRepository = typeOfSphereRepository;
        }

        /// <summary>
        /// Adds new social worker
        /// </summary>
        /// <param name="item">Contains data about new social worker</param>
        /// <returns>Status of add</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [Route("api/SocialWorkers/Add")]
        public IHttpActionResult CreateNewSocialWorker(SocialWorker item)
        {
            IHttpActionResult result = Ok();

                    if (item != null)
                    {
                        for (int i = 0; i < item.Sphere.Count; i++)
                        {
                            item.Sphere.ElementAt(i).Type = _typeOfSphereRepository.GetById(item.Sphere.ElementAt(i).Type.Id);
                            _socialSphereRepository.Create(item.Sphere.ElementAt(i));
                        }
                        _socialWorkerRepository.Create(item);
                        _socialSphereRepository.Save();
                        _socialWorkerRepository.Save();
                    }
                    else
                    {
                        result = BadRequest("Переданий об'єкт соціальних працівників не знайдено");
                    }

            return result;
        }

        /// <summary>
        /// Updates data about social worker and his sphere.
        /// </summary>
        /// <param name="item">Contains updated data of social worker</param>
        /// <returns>Status of update</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [Route("api/SocialWorkers/Update")]
        public IHttpActionResult UpdateSocialWorker(SocialWorker item)
        {
            IHttpActionResult result = Ok();

                if (item != null)
                {
                    SocialWorker socialWorker = _socialWorkerRepository.Get(c => c.Id == item.Id);
                    
                    if (socialWorker != null)
                    {
                        socialWorker.Name = item.Name;
                        socialWorker.Description = item.Description;
                        socialWorker.Longitude = item.Longitude;
                        socialWorker.Latitude = item.Latitude;
                        socialWorker.Email = item.Email;
                        socialWorker.PhoneNumber = item.PhoneNumber;
                        socialWorker.Address = item.Address;
                        socialWorker.ImageLink = item.ImageLink;

                        if (socialWorker.Sphere.Count != 0)
                        {
                            _socialSphereRepository.Delete(c => c.Worker.Id == socialWorker.Id);
                            _socialSphereRepository.Save();
                        }
                        if (item.Sphere != null)
                        {
                            for (int i = 0; i < item.Sphere.Count; i++)
                            {
                                item.Sphere.ElementAt(i).Type = _typeOfSphereRepository.GetById(item.Sphere.ElementAt(i).Type.Id);
                                _socialSphereRepository.Create(item.Sphere.ElementAt(i));
                                socialWorker.Sphere.Add(item.Sphere.ElementAt(i));
                            }
                        }
                        _socialSphereRepository.Save();
                        _socialWorkerRepository.Update(socialWorker);
                        _socialWorkerRepository.Save();
                    }
                    else
                    {
                        result = BadRequest("Соцільного працівника не знайдено");
                    }
                }
                else
                {
                    result = BadRequest("Переданий об'єкт соціальних працівників не знайдено");
                }

            return result;
        }

        public static object locker = new object();

        /// <summary>
        /// Deletes social worker by id
        /// </summary>
        /// <param name="id">Id of social worker</param>
        /// <returns>Status of delete</returns>
        [HttpDelete]
        [Route("api/SocialWorker/{id}")]
        public IHttpActionResult DeleteSocialWorkerById(int? id)
        {
            IHttpActionResult result = Ok();
            lock (locker)
            {
                if (id != null)
                {
                    _socialSphereRepository.Delete(c => c.Worker.Id == id);
                    _socialSphereRepository.Save();
                    _socialWorkerRepository.Delete(x => x.Id == id);
                    _socialWorkerRepository.Save();
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

            return result;
        }

        /// <summary>
        /// Gets data about all social workers
        /// </summary>
        /// <returns>Returns an <see cref="IEnumerable{SocialWorkerDTO}">IEnumerable&lt;SocialWorker&gt;</see> with all social workers</returns>
        [HttpGet]
        [AllowAnonymous]
        [Route("api/socialworkers/all")]
        [ActionName("GetAll")]
        public IEnumerable<SocialWorkerDTO> GetAllSocialWorkers()
        {
            var _socialworkers = _socialWorkerRepository.GetAll().Select(x => new SocialWorkerDTO()
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Longitude = x.Longitude,
                Latitude = x.Latitude,
                Rating = x.Rating,
                Email = x.Email,
                PhoneNumber = x.PhoneNumber,
                Gender = x.Gender,
                ImageLink = x.ImageLink,
                Address = x.Address
                });
                if (_socialworkers == null)
                {
                    var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                    {
                        Content = new StringContent("За вашим запитом, не було знайдено соціальних працівників")
                    };
                    throw new HttpResponseException(message);
                }

                return _socialworkers;
        }

        /// <summary>
        /// Gets data about all social workers and their types
        /// </summary>
        /// <returns>Returns an <see cref="IEnumerable{SocialWorkerDTO}">IEnumerable&lt;SocialWorker&gt;</see> with all social workers</returns>
        [HttpGet]
        [AllowAnonymous]
        [Route("api/socialworkers/allmarkers")]
        [ActionName("GetAll")]
        public IEnumerable<SocialWorkerDTO> GetAllSocialWorkersMarkers()
        {
            var _socialWorkers = from sw in _socialWorkerRepository.GetAll()
                                 join ss in _socialSphereRepository.GetAll() on sw.Id equals ss.Worker.Id
                                 join tos in _typeOfSphereRepository.GetAll() on ss.Type.Id equals tos.Id
                                 select new SocialWorkerDTO()
                                 {
                                     Id = sw.Id,
                                     SphereId = ss.Type.Id,
                                     Name = sw.Name,
                                     Longitude = sw.Longitude,
                                     Address = sw.Address,
                                     Description = sw.Description,
                                     Latitude = sw.Latitude,
                                     Rating = sw.Rating,
                                     Email = sw.Email,
                                     PhoneNumber = sw.PhoneNumber,
                                     Gender = sw.Gender,
                                     ImageLink = sw.ImageLink,
                                 };

            return _socialWorkers;
        }

        /// <summary>
        /// Gets data about social worker by id
        /// </summary>
        /// <param name="id">Id of social worker</param>
        /// <returns>Returns an <see cref="IEnumerable{SocialWorkerDTO}">IEnumerable&lt;SocialWorker&gt;</see> which contains data about social workers by id</returns>
        [HttpGet]
        [AllowAnonymous]
        [Route("api/socialworkersbysphere/{id}")]
        public IEnumerable<SocialWorkerDTO> GetSocialWorkersBySphereId(int? id)
        {
            if (id == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Неправильний запит")
                };
                throw new HttpResponseException(message);
            }
                var _socialWorkers = from sw in _socialWorkerRepository.GetAll()
                         join ss in _socialSphereRepository.GetAll() on sw.Id equals ss.Worker.Id
                         join tos in _typeOfSphereRepository.GetAll() on ss.Type.Id equals tos.Id
                         where tos.Id == id
                         select new SocialWorkerDTO()
                         {
                             Id = sw.Id,
                             Name = sw.Name,
                             Longitude = sw.Longitude,
                             Latitude = sw.Latitude,
                             Rating = sw.Rating,
                             Email = sw.Email,
                             PhoneNumber = sw.PhoneNumber,
                             Gender = sw.Gender,
                             ImageLink = sw.ImageLink,
                         };
                if (_socialWorkers == null)
                {
                    var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                    {
                        Content = new StringContent("За вашим запитом, не було знайдено соціальних працівників")
                    };
                    throw new HttpResponseException(message);
                }

                return _socialWorkers;
        }

        /// <summary>
        /// Gets data about social worker by id
        /// </summary>
        /// <param name="id">Id of social worker</param>
        /// <returns>Returns social worker</returns>
        [HttpGet]
        [Route("api/socialWorker/{id}")]
        public SocialWorker GetSocialWorkerById(int? id)
        {
            if (id != null)
            {
                return _socialWorkerRepository.Get(x => x.Id == id);
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
    }
}
