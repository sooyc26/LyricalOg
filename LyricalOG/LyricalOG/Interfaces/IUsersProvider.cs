using LyricalOG.Models;
using LyricalOG.Models.Users;
using myCrudApp.Models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace LyricalOG.Interfaces
{
    public interface IUsersProvider
    {
        string Login(UserLogin request);
        int Create(UsersCreateRequest request);
        List<User> ReadAll();
        User ReadById(int id);
        int UpdateUser(UsersUpdateRequest request, int id);
        int Delete(int id);
        Task EmailVerification(User request);
        bool ValidateToken(string token, out string username);
        Task<IPrincipal> AuthenticateJwtToken(string token);
        UserProfile GetUserProfile(int id);
        bool UpdatePassword(UsersUpdateRequest request);
    }
}
