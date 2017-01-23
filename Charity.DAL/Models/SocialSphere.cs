namespace Charity.DAL.Models
{
    public class SocialSphere
    {
        public int Id { get; set; }
        public virtual TypeOfSphere Type { get; set; }
        public virtual SocialWorker Worker { get; set; }
    }
}
