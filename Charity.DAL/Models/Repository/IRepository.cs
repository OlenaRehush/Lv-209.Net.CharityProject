using System;
using System.Linq;
using System.Linq.Expressions;

namespace Charity.DAL
{
    public interface IRepository<T>
    {
        IQueryable<T> GetAll(Expression<Func<T, bool>> filter = null);
        T Get(Expression<Func<T, bool>> filter);
        T GetById(int id);
        void Create(T item);
        void Update(T item);
        void Delete(Expression<Func<T, bool>> filter);
        void Delete(T item);
        void DeleteById(int id);
        void Save();
    }
}
