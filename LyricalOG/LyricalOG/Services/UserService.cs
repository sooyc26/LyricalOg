
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin.Security;
using LyricalOG.Interfaces;
using LyricalOG.Models;
using LyricalOG.Models.Users;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace LyricalOG.Services
{
    public class UserService : IUsersProvider
    {
        //readonly LyricService _lyricService;
        //readonly RecordService _recordService;

        //public UserService(LyricService lyricService)
        //{
        //    _lyricService = lyricService;
        //    _recordService = new RecordService();
        //}

        readonly string connString = ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
        readonly string jwtStr = ConfigurationManager.AppSettings["Jwt"];
        public UserLogin Login(UserLogin request)
        {
            using (var con = new SqlConnection(connString))
            {
                con.Open();

                SqlCommand cmd = con.CreateCommand();
                cmd.CommandText = "Users_Login";
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Email", request.Email);
                cmd.Parameters.AddWithValue("@Password", request.Password);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())//returns read if password matches in sproc
                    {
                        request.UserId = (int)reader["UserId"];
                        //request.Identity.Authentication = (bool)reader["Authentication"];
                        request.Name = (string)reader["Name"];
                        request.DateCreated = (DateTime)reader["DateCreated"];
                        request.IsAdmin = (bool)reader["IsAdmin"];
                        request.SessionToken = GenerateJSONWebToken(request);

                        //SignIn(request);
                    }
                    reader.Close();
                }
                con.Close();
            }
            return request;
        }

        protected void SignIn(UserLogin loginUser)
        {
            var userStore = new UserStore<IdentityUser>();
            var userManager = new UserManager<IdentityUser>(userStore);
            var user = new IdentityUser
            {
                UserName = loginUser.Email,               
            };

            IdentityResult result = userManager.Create(user, loginUser.Password);

            try
            {
                var authenticationManager = HttpContext.Current.GetOwinContext().Authentication;

                ClaimsIdentity identity = new ClaimsIdentity(DefaultAuthenticationTypes.ApplicationCookie);

                //identity.AddClaim(new Claim("http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider"
                //                    , _title
                //                    , ClaimValueTypes.String));
                var claims = new List<Claim>();
                claims.Add(new Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", loginUser.UserId.ToString(), ClaimValueTypes.Integer));
                //claims.Add(new Claim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", user.UserTypeId.ToString(), ClaimValueTypes.Integer));
                claims.Add(new Claim("IsMentorApproved", loginUser.Identity.Authentication.ToString(), ClaimValueTypes.Boolean));
                claims.Add(new Claim("IsConfirmed", loginUser.Identity.IsAdmin.ToString(), ClaimValueTypes.Boolean));
                identity.AddClaims(claims);

                AuthenticationProperties props = new AuthenticationProperties
                {
                    IsPersistent = true,
                    IssuedUtc = DateTime.UtcNow,
                    ExpiresUtc = DateTime.UtcNow.AddDays(60),
                    AllowRefresh = true
                };

                authenticationManager.SignIn(props, identity);
                var owin = authenticationManager;

                //var userIdentity = userManager.CreateIdentity(user, DefaultAuthenticationTypes.ApplicationCookie);

                //authenticationManager.SignIn(new AuthenticationProperties() { IsPersistent = false }, userIdentity);
            }
            catch (Exception e)
            {
                throw e.InnerException;
            }
                //Response.Redirect("~/Login.aspx");

            //else
            //{
            //    StatusText.Text = "Invalid username or password.";
            //    LoginStatus.Visible = true;
            //}
        }

        private string GenerateJSONWebToken(UserLogin userInfo)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtStr));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(jwtStr,
              jwtStr,
              null,
              expires: DateTime.Now.AddMinutes(120),
              signingCredentials: credentials);

            IdentityModelEventSource.ShowPII = true;

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        protected void SignOut(object sender, EventArgs e)
        {
            var authenticationManager = HttpContext.Current.GetOwinContext().Authentication;
            authenticationManager.SignOut();
            //Response.Redirect("~/Login.aspx");
        }
    

    public string CreateToken()
        {
            return "";
        }

        public int Create(UsersCreateRequest request)
        {
            int id = 0;

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Users_Insert";
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Name", request.Name);
                cmd.Parameters.AddWithValue("@Email", request.Email);
                cmd.Parameters.AddWithValue("@Password", request.Password);
                //cmd.Parameters.AddWithValue("@UserId", SqlDbType.Int).Direction = ParameterDirection.Output;

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        id = (int)reader["UserId"];
                    }
                    reader.Close();
                }
                conn.Close();
            }
            return id;
        }

        public List<User> ReadAll()
        {
            var Users = new List<User>();

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Select_BeatId";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

               // cmd.Parameters.AddWithValue("@BeatId", request.BeatUrl);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var User = new User()
                        {
                            Id = (int)reader["UserId"],
                            Name = ConvertFromDBVal<string>(reader["Name"]),
                            Email = (string)reader["Email"],
                            Password = (string)reader["Password"],
                            Lyrics = ConvertFromDBVal<string>(reader["Lyrics"]),
                            Votes = ConvertFromDBVal<int>(reader["Votes"]),
                            BeatUrl = ConvertFromDBVal<string>(reader["BeatUrl"]),
                            S3SignedUrl = ConvertFromDBVal<string>(reader["S3SignedUrl"]),

                            DateCreated = (DateTime)reader["DateCreated"],
                            DateModified = ConvertFromDBVal<DateTime>(reader["DateModified"])
                        };
                        Users.Add(User);
                    }
                    conn.Close();
                }
            }
            Users = Users.GroupBy(u => u.Id).Select(x=>x.First()).Distinct().ToList();
            return Users;
        }

        public User ReadById(int id)
        {
            var Users = new User();

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Users_Select_ById";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserId", id);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var User = new User()
                        {
                            Id = (int)reader["Id"],
                            Name = (string)reader["Name"],
                            Email = (string)reader["Email"],
                            Password = (string)reader["Password"],
                            Lyrics = (string)reader["Lyrics"],
                            Votes = (int)reader["Votes"],
                            BeatUrl = (string)reader["BeatUrl"],
                            S3SignedUrl = (string)reader["S3SignedUrl"],

                            DateCreated = (DateTime)reader["DateCreated"],
                            DateModified = (DateTime)reader["DateModified"]
                        };
                        Users = User;
                    }
                }
                conn.Close();
            }
            return Users;
        }

        public int UpdateUser(UsersUpdateRequest request, int id)
        {
            int retId = 0;
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "User_Update";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserId", id);
                cmd.Parameters.AddWithValue("@Name", request.Name);
                cmd.Parameters.AddWithValue("@Email", request.Email);
                cmd.Parameters.AddWithValue("@Paswword", request.Paswword);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        retId = (int)reader["Id"];
                    }
                }
                conn.Close();
            }
            return retId;
        }

        public int Delete(int id)
        {
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Users_Delete";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserId", id);
                cmd.ExecuteNonQuery();

                conn.Close();
            }
            return id;
        }

        public async Task EmailValidation()
        {
            var apiKey = Environment.GetEnvironmentVariable("NAME_OF_THE_ENVIRONMENT_VARIABLE_FOR_YOUR_SENDGRID_KEY");
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress("test@example.com", "Example User");
            var subject = "Sending with SendGrid is Fun";
            var to = new EmailAddress("test@example.com", "Example User");
            var plainTextContent = "and easy to do anywhere, even with C#";
            var htmlContent = "<strong>and easy to do anywhere, even with C#</strong>";
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg);
        }


        public static T ConvertFromDBVal<T>(object obj)
        {
            if (obj == null || obj == DBNull.Value)
            {
                return default(T); // returns the default value for the type
            }
            else
            {
                return (T)obj;
            }
        }
    }
}