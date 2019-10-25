using LyricalOG.Models;
using LyricalOG.Models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LyricalOG.Interfaces
{
    public interface IUsersProvider
    {
        UserLogin Login(UserLogin request);
        int Create(UsersCreateRequest request);
        List<User> ReadAll();
        User ReadById(int id);
        int UpdateUser(UsersUpdateRequest request, int id);
        int Delete(int id);
        Task EmailValidation();
    }
}
