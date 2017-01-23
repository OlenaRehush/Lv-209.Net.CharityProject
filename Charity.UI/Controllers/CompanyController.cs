using Charity.DAL;
using Charity.DAL.Models;
using Charity.Services.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Net.Http;
using System.Net;
using Charity.Services;

namespace Charity.UI.Controllers
{
    [AllowAnonymous]
    public class CompanyController : ApiController
    {
        private IRepository<Company> _companyRepository;
        private IRepository<ApplicationUser> _userRepository;
        private IRepository<Resource> _resourceRepository;
        private IRepository<NeedRequest> _requestRepository;
        private ApplicationUser _user;

        private ApplicationUser AppUser
        {
            get
            {
                return _user == null ? _userRepository.Get(c => c.UserName == User.Identity.Name) : _user;
            }
        }

        public CompanyController(
            IRepository<NeedRequest> requestRepository,
            IRepository<Resource> resourceRepository,
            IRepository<Company> companyRepository,
            IRepository<ApplicationUser> userRepository)
        {
            _companyRepository = companyRepository;
            _userRepository = userRepository;
            _resourceRepository = resourceRepository;
            _requestRepository = requestRepository;
        }

        /// <summary>
        /// Gets data about all companies
        /// </summary>
        /// <returns>Returns an <see cref="IEnumerable{CompanyDTO}">IEnumerable&lt;CompanyDTO&gt;</see> with all companies</returns>
        [Route("api/companies/allcompanies")]
        [ActionName("GetAll")]
        public IEnumerable<CompanyDTO> GetAllСompanies()
        {
            var _companies = _companyRepository.GetAll().Select(x => new CompanyDTO()
            {
                Id = x.Id,
                Name = x.User.FullName,
                Longitude = x.Longitude,
                Latitude = x.Latitude,
                Address = x.User.Address,
                WebSite = x.User.WebSite,
                Description = x.User.Description
            }).AsQueryable();

            return _companies;
        }

        /// <summary>
        /// Gets information of company by id
        /// </summary>
        /// <param name="id">Id of company</param>
        /// <returns>Returns an <see cref="IEnumerable{CompanyDTO}">IEnumerable&lt;CompanyDTO&gt;</see> with companies by id</returns>
        [HttpGet]
        [Route("api/companies/{id}")]
        public async Task<IEnumerable<CompanyDTO>> GetCompanyByIdAsync(int? id)
        {
            if (id == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Неправильний запит")
                };
                throw new HttpResponseException(message);
            }
            var _company = await Task.Run(() => _companyRepository.GetAll().Select(x => new CompanyDTO()
            {
                Id = x.Id,
                Name = x.User.FullName,
                Longitude = x.Longitude,
                Latitude = x.Latitude,
                Address = x.User.Address,
                WebSite = x.User.WebSite
            }).Where(x => x.Id == id));

            if (_company == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("За вашим запитом, не було знайдено організацій")
                };

                throw new HttpResponseException(message);
            }

            return _company;
        }


        /// <summary>
        /// Updates information about company
        /// </summary>
        /// <param name="item">Contains updated data of company</param>
        [HttpPut]
        [Route("api/companies/updates")]
        public void UpdateCompany([FromBody]Company item)
        {
            if (item == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Неправильний запит")
                };
                throw new HttpResponseException(message);
            }
            if (item != null)
            {
                _companyRepository.Update(item);
            }
        }

        /// <summary>
        /// Adds new resource of company
        /// </summary>
        /// <param name="model">Contains data about new resorce</param>
        /// <returns>Status of add</returns>
        [HttpPut]
        [Authorize(Roles = "Company")]
        [Route("api/Company/AddResource")]       
        public IHttpActionResult Update(Resource model)
        {
            Resource resource = new Resource()
            {
                Company = AppUser.Company,
                Description = model.Description,
                ImageLink = model.ImageLink,
                Name = model.Name
            };

            _resourceRepository.Create(resource);
            _resourceRepository.Save();

            return Ok();
        }

        /// <summary>
        /// Update information about resource of company
        /// </summary>
        /// <param name="model">Contains updated data of resource</param>
        /// <returns>Status of update</returns>
        [HttpPut]
        [Authorize(Roles = "Company")]
        [Route("api/Company/EditResource")]        
        public IHttpActionResult Edit(Resource model)
        {
            model.Company = AppUser.Company;
            _resourceRepository.Update(model);
            _resourceRepository.Save();

            return Ok();
        }

        /// <summary>
        /// Delete resource of company
        /// </summary>
        /// <param name="id">Id of resource</param>
        /// <returns>Status of delete</returns>
        [HttpPut]
        [Authorize(Roles = "Company")]
        [Route("api/Company/DeleteResource")]        
        public IHttpActionResult Delete(int id)
        {
            _resourceRepository.DeleteById(id);
            _resourceRepository.Save();

            return Ok();
        }
    }

}
