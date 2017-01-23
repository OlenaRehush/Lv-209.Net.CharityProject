using Charity.DAL;
using Charity.DAL.Models;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Charity.Services.Models;
using Microsoft.AspNet.Identity;
using Charity.Services;
using System.Net.Http;
using System.Net;

namespace Charity.UI.Controllers
{
    public class UserController : ApiController
    {
        private IRepository<ApplicationUser> _userRepository;
        private IRepository<CustomRole> _cutomRoleRepository;
        private IRepository<CustomUserRole> _cutomUserRole;
        private IRepository<Organization> _organizationRepository;
        private IRepository<Company> _companyRepository;
        private IRepository<Need> _needRepository;
        private IRepository<NeedRequest> _requestRepository;
        private IRepository<Resource> _resourceRepository;

        public UserController(IRepository<Resource> _resourceRepository, IRepository<NeedRequest> _requestRepository, IRepository<Need> _needRepository, IRepository<Company> _companyRepository, IRepository<Organization> _organizationRepository, IRepository<ApplicationUser> userRepository,
            IRepository<CustomRole> cutomRoleRepository, IRepository<CustomUserRole> cutomUserRole)
        {
            _userRepository = userRepository;
            _cutomRoleRepository = cutomRoleRepository;
            _cutomUserRole = cutomUserRole;
            this._organizationRepository = _organizationRepository;
            this._companyRepository = _companyRepository;
            this._needRepository = _needRepository;
            this._requestRepository = _requestRepository;
            this._resourceRepository = _resourceRepository;
        }

        /// <summary>
        /// Gets data about all users
        /// </summary>
        /// <returns>Returns an <see cref="IEnumerable{UserDTO}">IEnumerable&lt;UserDTO&gt;</see></returns>
        [Route("api/users/allusers")]
        [ActionName("GetAll")]
        public IEnumerable<UserDTO> GetAllUsers()
        {             
                var _users = _userRepository.GetAll().Select(x => new UserDTO()
                {
                    Id = x.Id,
                    FullName = x.FullName,
                    UserName = x.UserName,          
                    Birthday = x.Birthday,
                    Rating = x.Rating,
                    Address = x.Address,
                    Email = x.Email,
                    PhoneNumber = x.PhoneNumber,
                    WebSite = x.WebSite,
                    PhotoURL = x.PhotoURL,
                    Description = x.Description,
                    isBanned = x.isBanned
                }).AsQueryable();
            if (_users == null)
            {
                var message = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("Користувачів не знайдено")
                };
                throw new HttpResponseException(message);
            }
            return _users;
        }

        /// <summary>
        /// Updates information about ApplicationUser
        /// </summary>
        /// <param name="userToUpDate">Contains updated data of ApplicationUser</param>
        [HttpPut]
        [Route("api/users/updates")]
        public void UpdateUser([FromBody]ApplicationUser userToUpDate)
        {
            ApplicationUser user = _userRepository.GetById(userToUpDate.Id);
            userToUpDate.Company = user.Company;
            userToUpDate.Organization = user.Organization;
            userToUpDate.NeedRequests = user.NeedRequests;
            userToUpDate.Needs = user.Needs;
            userToUpDate.Needs = user.Needs;
            _userRepository.Update(userToUpDate);
            _userRepository.Save();
        }

        /// <summary>
        /// Updates information about Company or Organization
        /// </summary>
        /// <param name="userToUpDate">Contains updated data of Company or Organization</param>
        [HttpPut]
        [Route("api/User/Update")]
        public void UpdateCompanyOrOrganizationUser([FromBody]ApplicationUser userToUpDate)
        {

            ApplicationUser user = _userRepository.Get(x => x.Id == userToUpDate.Id);
            user.FullName = userToUpDate.FullName;
            user.UserName = userToUpDate.UserName;
            user.WebSite = userToUpDate.WebSite;
            user.Address = userToUpDate.Address;
            user.Description = userToUpDate.Description;
            user.Birthday = userToUpDate.Birthday;  
            _userRepository.Update(user);
            _userRepository.Save();
        }

        /// <summary>
        /// Gets information of ApplicationUser by id
        /// </summary>
        /// <param name="id">Id of ApplicationUser</param>
        /// <returns>ApplicationUser user</returns>
        [HttpGet]
        [AllowAnonymous]
        [Route("api/user/{id}")]
        public ApplicationUser GetUserById(int id)
        {
            ApplicationUser user = _userRepository.Get(c => c.Id == id);

            foreach (var role in _cutomUserRole.GetAll(c => c.UserId == user.Id))
            {
                if(!user.Roles.Contains(role))
                    user.Roles.Add(role);
            }

            user.Organization = _organizationRepository.Get(c => c.User.Email == user.Email);
            return user; 
        }

        /// <summary>
        /// Ban user by ApplicationUser model
        /// </summary>
        /// <param name="userToBan">user model to Ban</param>
        /// <returns>Status of ban</returns>
        [Authorize(Roles="Admin")]
        [HttpPut]
        [Route("api/ban")]
        public IHttpActionResult BanUser([FromBody]ApplicationUser userToBan)
        {            
            var manager = new ApplicationUserManager(new CustomUserStore(new CharityContext()));
            var user = manager.FindById(userToBan.Id);
            user.isBanned = !user.isBanned;
            var result = manager.UpdateAsync(user);
            return Ok();
        }
    }
}
