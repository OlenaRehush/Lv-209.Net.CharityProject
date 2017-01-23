using Charity.DAL;
using Charity.DAL.Models;
using Charity.Services.Models;
using Charity.UI.Controllers;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace Charity.Tests.Controllers
{
    [TestFixture]
    public class NeedControllerTests
    {
        private Mock<IRepository<Need>> _needRepository;
        private Mock<IRepository<Organization>> _organizationRepository;
        private Mock<IRepository<ApplicationUser>> _user;
        private Mock<IRepository<TypeOfNeed>> _need;
        private Mock<IRepository<NeedRequest>> _requestRepository;
        private Mock<IRepository<Media>> _mediaRepository;
        private List<Need> needs;
        private List<NeedDTO> needsDTO;
        Need need;
        NeedDTO needDTO;
        private readonly IEqualityComparer<NeedDTO> _needsDTOComparer
            = new NeedsEqualityComparer();


        [SetUp]
        public void SetUpFixture()
        {
            _needRepository = new Mock<IRepository<Need>>();
            _organizationRepository = new Mock<IRepository<Organization>>();
            _user = new Mock<IRepository<ApplicationUser>>();
            _need = new Mock<IRepository<TypeOfNeed>>();
            _requestRepository = new Mock<IRepository<NeedRequest>>();
            _mediaRepository = new Mock<IRepository<Media>>();
            needs = new List<Need>
            {
                new Need {
                    Id= 1477,
                    TypeOfNeed = new TypeOfNeed { Id = 12 },
                    Name="test",
                    Description="descr",
                    State=DAL.Enums.State.Passive,
                    DateCreated=new DateTime(2016,10,23),
                    DateEnd=null,
                    ImageLink="link",
                    Tags=new List<Tag>(),
                    Media=new List<Media>(),
                    User = new ApplicationUser {FullName = "Ivan Ivanovich" },
                    NeedRequests=new List<NeedRequest>()
                    {
                        new NeedRequest()
                        {
                            Id=1,
                            User=new ApplicationUser() {FullName="Bogdan Bogdanovich" },
                            Status=true
                        }
                    }
                }
            };

            needsDTO = new List<NeedDTO>()
            {
                new NeedDTO
                {
                    Id = 1477,
                Name = "test",
                Status = "Виконано",
                DateCreated = new DateTime(2016, 10, 23),
                DateEnd = null,
                Description = "descr",
                Photos = null,
                Videos = null,
                Feedback=null,
                ImageLink = "link",
                User = "Bogdan Bogdanovich",
                UserId = null,
                OrganizationId = 0,
                UserPhoneNumber = null,
                UserPhoto = null,
                TypeOfNeed = needs.First().TypeOfNeed.Type,
                Organization = "Ivan Ivanovich"
                }
            };

            needDTO = new NeedDTO()
            {
                Id = 1477,
                Name = "test",
                Status = "Виконано",
                DateCreated = new DateTime(2016, 10, 23),
                DateEnd = null,
                Description = "descr",
                Photos = new List<string>(),
                Videos = new List<string>(),
                Feedback = null,
                ImageLink = "link",
                User = "Bogdan Bogdanovich",
                UserId = null,
                OrganizationId = 0,
                UserPhoneNumber = null,
                UserPhoto = null,
                TypeOfNeed = needs.First().TypeOfNeed.Type,
                Organization = "Ivan Ivanovich"
            };

        }
        [Test]
        public void GetAllNeeds_Returns_All_Needs_From_Repository()
        {
           //Act
            _needRepository.Setup(x => x.GetAll(null)).Returns(needs.AsQueryable());

            var controller = new NeedController(_needRepository.Object, _organizationRepository.Object, _user.Object, _need.Object, _mediaRepository.Object, _requestRepository.Object);
            var res = controller.GetAllNeeds().Result;
            

            //Assert
            NUnit.Framework.Assert.That(res.Count() == 1);
            NUnit.Framework.Assert.That(res.First().Id == 1477);
            //NUnit.Framework.CollectionAssert.AreEqual(res.Select(x => x.ToString()).ToList(), needsDTO.Select(x => x.ToString()).ToList());
            NUnit.Framework.Assert.That(res, Is.EqualTo(needsDTO).Using(_needsDTOComparer).AsCollection);
        }
        
        [Test]
        [ExpectedException(typeof(HttpResponseException))]
        public void GetAllNeeds_When_List_Of_Needs_Is_Empty_Then_Throw_Exception()
        {
            //Act
            var needs = new List<Need>().AsQueryable();

            _needRepository.Setup(x => x.GetAll(null)).Returns(needs);

            var controller = new NeedController(_needRepository.Object, _organizationRepository.Object, _user.Object, _need.Object, _mediaRepository.Object, _requestRepository.Object);
            var res = controller.GetAllNeeds().Result;
        }

        [Test]
        public void GetNeedById_Return_Need_From_Repository()
        {
            var id = 1477;
            _needRepository.Setup(x => x.GetById(It.IsAny<int>()))
                .Returns((int i) => needs.AsQueryable().Where(u => u.Id == i).Single());

            var controller = new NeedController(_needRepository.Object, _organizationRepository.Object, _user.Object, _need.Object, _mediaRepository.Object, _requestRepository.Object);

            var result = controller.GetNeedById(id).Result;

            //Assert
            NUnit.Framework.Assert.That(result, Is.EqualTo( needDTO).Using(_needsDTOComparer));
        }

        [Test]
        public void Delete_Need_By_Id_From_Repository()
        {
            var additionalNeed = new Need()
            {
                Id = 147,
                TypeOfNeed = new TypeOfNeed { Id = 12 },
                Name = "test1",
                Description = "descr1",
                State = DAL.Enums.State.Passive,
                DateCreated = new DateTime(2016, 10, 23),
                DateEnd = null,
                ImageLink = "link1",
                Tags = new List<Tag>(),
                Media = new List<Media>(),
                User = new ApplicationUser { FullName = "Ivan Ivanovich1" },
                NeedRequests = new List<NeedRequest>()
                    {
                        new NeedRequest()
                        {
                            Id=1,
                            User=new ApplicationUser() {FullName="Bogdan Bogdanovich1" },
                            Status=true
                        }
                    }
            };

            needs.Add(additionalNeed);
            
            var id = 147;
            _needRepository.Setup(x => x.GetAll(null)).Returns(needs.AsQueryable);
            _needRepository.Setup(x => x.Delete(It.IsAny<Expression<Func<Need, bool>>>()))
                .Callback(( Expression<Func<Need, bool>> nId) =>
                {
                    needs.RemoveAll(x => nId.Compile().Invoke(x));
                });

            var controller = new NeedController(_needRepository.Object, _organizationRepository.Object, _user.Object, _need.Object, _mediaRepository.Object, _requestRepository.Object);

            controller.DeleteNeedById(id);

            var result = controller.GetAllNeeds().Result;

            NUnit.Framework.Assert.That(result.Count() == 1);
        }

        [Test]
        public void Update_Need_In_Repository()
        {
            int id = 1477;

            _needRepository.Setup(x => x.GetById(It.IsAny<int>()))
               .Returns((int i) => needs.AsQueryable().Where(u => u.Id == i).Single());

            _needRepository.Setup(x => x.Update(It.IsAny<Need>()))
                .Callback((Need n) =>
                {
                    var i=needs.FindIndex(x => x.Id == n.Id);
                    needs[i] = n;
                });

            var controller = new NeedController(_needRepository.Object, _organizationRepository.Object, _user.Object, _need.Object, _mediaRepository.Object, _requestRepository.Object);

            var tempNeed = _needRepository.Object.GetById(id);
            tempNeed.Name = "new name";
            controller.UpdateNeed(tempNeed);

            var result = controller.GetNeedById(id).Result;

            NUnit.Framework.Assert.That(result.Name==tempNeed.Name);
        }

        [Test]
        public void Add_Need_By_To_Repository()
        {
            var additionalNeed = new Need()
            {
                Id = 147,
                TypeOfNeed = new TypeOfNeed { Id = 12 },
                Name = "test1",
                Description = "descr1",
                State = DAL.Enums.State.Passive,
                DateCreated = new DateTime(2016, 10, 23),
                DateEnd = null,
                ImageLink = "link1",
                Tags = new List<Tag>(),
                Media = new List<Media>(),
                User = new ApplicationUser { FullName = "Ivan Ivanovich1" },
                NeedRequests = new List<NeedRequest>()
                    {
                        new NeedRequest()
                        {
                            Id=1,
                            User=new ApplicationUser() {FullName="Bogdan Bogdanovich1" },
                            Status=true
                        }
                    }
            };
            
            _needRepository.Setup(x => x.GetAll(null)).Returns(needs.AsQueryable);
            _needRepository.Setup(x => x.Create(It.IsAny<Need>()))
                .Callback((Need nId) =>
                {
                    needs.Add(nId);
                });

            var controller = new NeedController(_needRepository.Object, _organizationRepository.Object, _user.Object, _need.Object, _mediaRepository.Object, _requestRepository.Object);

            controller.CreateNewNeed(additionalNeed);

            var result = controller.GetAllNeeds().Result;

            NUnit.Framework.Assert.That(result.Count() == 2);
        }

        //private class NeedsDTOComparer : NeedDTO
        //{
        //    public override bool Equals(object obj)
        //    {
        //        if(ReferenceEquals(this, obj))
        //        {
        //            return true;
        //        }

        //        var need = obj as NeedDTO;

        //        return need != null
        //            && Id == need.Id
        //            && string.Equals(Name, need.Name)
        //            && string.Equals(Status, need.Status)
        //            && string.Equals(Description, need.Description)
        //            && string.Equals(ImageLink, need.ImageLink)
        //            && string.Equals(Organization, need.Organization)
        //            && string.Equals(TypeOfNeed, need.TypeOfNeed);
        //    }

        //    public override int GetHashCode()
        //    {
        //        return base.GetHashCode();
        //    }
        //}

        private class NeedsEqualityComparer : IEqualityComparer<NeedDTO>
        {
            public bool Equals(NeedDTO x, NeedDTO y)
            {
                return x.Id == y.Id &&
                    string.Equals(x.Name, y.Name) &&
                    string.Equals(x.Organization, y.Organization)&&
                    string.Equals(x.Status, y.Status) &&
                    string.Equals(x.Description, y.Description);
            }

            public int GetHashCode(NeedDTO obj)
            {
                return obj.GetHashCode();
            }
        }
    }
}
