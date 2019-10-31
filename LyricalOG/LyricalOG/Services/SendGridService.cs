using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using LyricalOG.Services;
using LyricalOG.Models;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Security.Cryptography;
using System.Net.Mail;
using System.Data.SqlClient;
using System.Data;
using LyricalOG.Models.Users;
using LyricalOG.Interfaces;

namespace LyricalOG.Services
{
    public class SendGridService: ISendGridProvider
    {
        //private IDataProvider _dataProvider;

        //public SendGridService(IDataProvider dataProvider)
        //{
        //    _dataProvider = dataProvider;

        //}
        readonly string connString = ConfigurationManager.ConnectionStrings["Default"].ConnectionString;

        public string GetUniqueKey(int maxSize)
        {
            char[] chars = new char[62];
            chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".ToCharArray();
            byte[] data = new byte[1];
            using (RNGCryptoServiceProvider crypto = new RNGCryptoServiceProvider())
            {
                crypto.GetNonZeroBytes(data);
                data = new byte[maxSize];
                crypto.GetNonZeroBytes(data);
            }
            StringBuilder result = new StringBuilder(maxSize);
            foreach (byte b in data)
            {
                result.Append(chars[b % (chars.Length)]);
            }
            return result.ToString();
        }

        public async Task<Response> SendEmail(User request)
        {

            var user = new User();

            int expireTime = int.Parse(ConfigurationManager.AppSettings["PasswordResetExpirationDate"]);

            DateTime expireDate = DateTime.UtcNow.AddHours(expireTime);

            string SecretPasswordKey = GetUniqueKey(64);

            using (var conn = new SqlConnection(connString))
            {

                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Users_IssuePasswordResetKey";
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Email", request.Email);
                cmd.Parameters.AddWithValue("@PasswordResetKey", SecretPasswordKey);
                cmd.Parameters.AddWithValue("@PasswordResetKeyExpirationDate", expireDate);

                conn.Close();
            }

            var apiKey = ConfigurationManager.AppSettings["SendGridKey"];
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress("noreply@lyrical.og", "Lyrical OG");
            var subject = "Lyrical OG Reset Password";
            var to = new EmailAddress(request.Email, "");
            var plainTextContent = "Please click on the link below to reset your account password!";

            var resetAddress = ConfigurationManager.AppSettings["PasswordResetAddress"];
            string htmlContent = string.Format("<a href=\"{0}{1}\"> Click here to reset password</a>", resetAddress, SecretPasswordKey);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            Response response = await client.SendEmailAsync(msg);

            return response;

        }

        public UserKeyExpireCheck CheckExpireDate(string check)
        {
            UserKeyExpireCheck user = new UserKeyExpireCheck();

            DateTime key = new DateTime();

            using (var conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Users_Select_ByPasswordKey";
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Password", check);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        key = (DateTime)reader["PasswordResetKeyExpirationDate"];
                        user.Id = (int)reader["Id"];
                    }
                    reader.Close();
                }
                conn.Close();
            }

            DateTime today = DateTime.UtcNow;
            DateTime expireDate = key;
            int result = DateTime.Compare(today, expireDate);

            if (result <= 0)
            {
                user.ExpireBoolean = true;
                user.ReturnMessage = "key not expired ";
            }
            else
            {
                user.ExpireBoolean = false;
                user.ReturnMessage = "key expired ";
            }
            return user;
        }
    }
}