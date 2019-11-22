using LyricalOG.Models;
using LyricalOG.Models.Users;
using SendGrid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace LyricalOG.Interfaces
{
    public interface ISendGridProvider
    {
        Task<Response> SendVerification(User request);
        Task<Response> SendPasswordReset(User request);
        UserKeyExpireCheck CheckExpireDate(string check);
    }
}
