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

        readonly string sendgridKey = ConfigurationManager.AppSettings["SendGridKey"];
        readonly string connString = ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
        readonly int expireTime = int.Parse(ConfigurationManager.AppSettings["PasswordResetExpirationDate"]);
        readonly string resetAddress = ConfigurationManager.AppSettings["PasswordResetUrl"];
        readonly string verifyAddress = ConfigurationManager.AppSettings["VerificationUrl"];
        SendGridClient _sendGridClient; 

        public SendGridService()
        {
            _sendGridClient = new SendGridClient(sendgridKey);
        }
        private string GetUniqueKey(int maxSize)
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

        public async Task<Response> SendVerification(User request)
        {
            string SecretKey = GetUniqueKey(64);

            using (var conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Users_Insert_VerificationKey";
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Email", request.Email);
                cmd.Parameters.AddWithValue("@VerificationKey", SecretKey);
                cmd.ExecuteNonQuery();

                conn.Close();
            }

            var href = verifyAddress + SecretKey;
            var msg = new SendGridMessage
            {
                From = new EmailAddress("no-reply@lyrical.og", "Lyrical OG"),
                Subject = "Lyrical OG Email Verification",
                PlainTextContent = "Please click on the link below",
                HtmlContent = string.Format("<a href=\"{0}\"> click here to verify your account.{1}</a>", href, SecretKey)
            };

            //var from = new EmailAddress("no-reply@lyrical.og", "Lyrical OG");
            //var subject = "Lyrical OG Verification Link";
            //var to = new EmailAddress(request.Email, request.Name);
            //var plainTextContent = "Please click on the link below to verify your account.";

            //var verificationUrl = ConfigurationManager.AppSettings["VerificationUrl"];
            //string htmlContent = string.Format("<a href=\"{0}{1}\"> Click here to verify your account</a>", verificationUrl, SecretKey);
            //var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);

            Response response = await _sendGridClient.SendEmailAsync(msg);

            return response;

        }

        public async Task<Response> SendPasswordReset(User request)
        {
            //var domain = ConfigurationManager.AppSettings["AppDomainAddress"];
            DateTime expireDate = DateTime.UtcNow.AddHours(expireTime);
            string SecretPasswordKey = GetUniqueKey(64);

            using (var conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Users_Update_PasswordKey";
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Email", request.Email);
                cmd.Parameters.AddWithValue("@PasswordKey", SecretPasswordKey);
                cmd.Parameters.AddWithValue("@ExpireDate", expireDate);

                cmd.ExecuteNonQuery(); 

                conn.Close();
            }

            var href = resetAddress+ SecretPasswordKey;
            var msg = new SendGridMessage
            {
                From = new EmailAddress("no-reply@lyrical.og", "Lyrical OG"),
                Subject = "Lyrical OG Password Reset Link",
                PlainTextContent  = "Please click on the link below",
                HtmlContent = string.Format("<a href=\"{0}\"> click here to reset password.{1}</a>", href, SecretPasswordKey)        
            };

            msg.AddTo(new EmailAddress(request.Email, "recepient"));
            Response response = await _sendGridClient.SendEmailAsync(msg);

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

                cmd.Parameters.AddWithValue("@Key", check);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        key = (DateTime)reader["PWResetExireDate"];
                        user.Id = (int)reader["UserId"];
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