
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
using System.Web.Script.Serialization;
using System.Security.Principal;
using Newtonsoft.Json;
using myCrudApp.Models.Users;

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
        public string Login(UserLogin request)
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
                        request.Name = (string)reader["Name"];
                        request.DateCreated = (DateTime)reader["DateCreated"];
                        request.IsAdmin = (bool)reader["IsAdmin"];
                        request.EmailVerified = (bool)reader["EmailVerified"];
                    }
                    reader.Close();
                }
                con.Close();
            }
            return GenerateJSONWebToken(request);
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

        //private string GenerateJSONWebToken(UserLogin userInfo)
        //{
        //    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtStr));
        //    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        //    var json = new JavaScriptSerializer().Serialize(userInfo);

        //    var token = new JwtSecurityToken(jwtStr,
        //      json,
        //      null,
        //      expires: DateTime.Now.AddMinutes(30),
        //      signingCredentials: credentials);

        //    IdentityModelEventSource.ShowPII = true;

        //    return new JwtSecurityTokenHandler().WriteToken(token);
        //}

        private string GenerateJSONWebToken(UserLogin userInfo)
        {
            var symmetricKey =Convert.FromBase64String(jwtStr);
            var tokenHandler = new JwtSecurityTokenHandler();
            var now = DateTime.UtcNow;

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("currUser", JsonConvert.SerializeObject(userInfo))
                }),

                Expires = now.AddMinutes(30),               //from expire date appsettings
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(symmetricKey),
                SecurityAlgorithms.HmacSha256Signature)
            };
            var stoken = tokenHandler.CreateJwtSecurityToken(tokenDescriptor);
            var token = tokenHandler.WriteToken(stoken);

            return token;
        }

        public bool ValidateToken(string token,out string username)
        {
            username =null;

            var simplePrinciple = GetPrincipal(token);
            var identity = simplePrinciple.Identity as ClaimsIdentity;

            if (identity == null)
                return false;

            if (!identity.IsAuthenticated)
                return false;

            var usernameClaim = identity.FindFirst("currUser");
            username = usernameClaim?.Value;

            if (string.IsNullOrEmpty(username))
                return false;

            // More validate to check whether username exists in system

            return true;
        }

        public Task<IPrincipal> AuthenticateJwtToken(string token)
        {
            string username;

            if (ValidateToken(token, out username))
            {
                // based on username to get more information from database 
                // in order to build local identity
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, username)
                    // Add more claims if needed: Roles, ...
                };

                var identity = new ClaimsIdentity(claims, "Jwt");
                IPrincipal user = new ClaimsPrincipal(identity);

                return Task.FromResult(user);
            }

            return Task.FromResult<IPrincipal>(null);
        }
        protected void SignOut(object sender, EventArgs e)
        {
            var authenticationManager = HttpContext.Current.GetOwinContext().Authentication;
            authenticationManager.SignOut();
            //Response.Redirect("~/Login.aspx");
        }
    
        protected ClaimsPrincipal GetPrincipal(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = (JwtSecurityToken)tokenHandler.ReadToken(token);

                if (jwtToken == null) return null;
                var key = Convert.FromBase64String(jwtStr);

                var parameters = new TokenValidationParameters
                {
                    RequireExpirationTime = true,
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };

                var principal = tokenHandler.ValidateToken(token, parameters, out SecurityToken securityToken);
                return principal;
            }
            catch (Exception e)
            {
                return null;
            }
        }

        public int Create(UsersCreateRequest request)
        {
            int retId = 0;

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
                       retId = (int)reader["UserId"];
                    }
                    reader.Close();
                }
                conn.Close();
            }
            return retId;
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
                            Lyrics = ConvertFromDBVal<string>(reader["Lyrics"]),
                            Votes = ConvertFromDBVal<int>(reader["Votes"]),
                            BeatUrl = ConvertFromDBVal<string>(reader["BeatUrl"]),
                            Password = (string)reader["Password"],

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

        public UserProfile GetUserProfile(int id)
        {
            var profileList = new List<UserProfileDB>();
            var retModel = new UserProfile();
            try
            {
                using (SqlConnection conn = new SqlConnection(connString))
                {
                    conn.Open();

                    SqlCommand cmd = conn.CreateCommand();
                    cmd.CommandText = "User_Profile";
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", id);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var user = new UserProfileDB
                            {
                                Id = (int)reader["UserId"],
                                Name = (string)reader["Name"],
                                Email = (string)reader["Email"],
                                Password = (string)reader["Password"],
                                DateCreated = (DateTime)reader["DateCreated"],
                                DateModified = (DateTime)reader["DateModified"],
                                EmailVerified = (bool)reader["EmailVerified"],
                                IsAdmin = (bool)reader["IsAdmin"],

                                LyricsId = reader["LyricsId"] == DBNull.Value ? 0 : (int)reader["LyricsId"],
                                LyricsBeatId = reader["LyricsBeatId"] == DBNull.Value ? 0 :  (int)reader["LyricsBeatId"],
                                LyricsTitle = reader["LyricsTitle"] == DBNull.Value ? "" : (string)reader["LyricsTitle"],
                                LyricsProducer = reader["LyricsProducer"] == DBNull.Value ? "" : (string)reader["LyricsProducer"],
                                LyricsDateCreated = reader["LyricsDateCreated"] == DBNull.Value ?  DateTime.MinValue :  (DateTime)reader["LyricsDateCreated"],

                                BeatId = reader["BeatId"] == DBNull.Value ? 0 : (int)reader["BeatId"],
                                BeatTitle = reader["BeatTitle"] == DBNull.Value ? "" : (string)reader["BeatTitle"],
                                BeatProducer = reader["BeatProducer"] == DBNull.Value ? "" : (string)reader["BeatProducer"],
                                BeatUploadDate = reader["BeatUploadDate"] == DBNull.Value ? DateTime.MinValue : (DateTime)reader["BeatUploadDate"],

                            };
                            profileList.Add(user);
                        }
                    }
                    conn.Close();
                }
                //group by user
                var groupUser = profileList.GroupBy(x => new
                {
                    x.Id,
                    x.Password,
                    x.Name,
                    x.Email,
                    x.DateCreated,
                    x.DateModified,
                    x.EmailVerified,
                    x.IsAdmin
                }).Select(y => new UserProfile
                {
                    Id = y.Key.Id,
                    Password = y.Key.Password,
                    Name = y.Key.Name,
                    Email = y.Key.Email,
                    DateCreated = y.Key.DateCreated,
                    DateModified = y.Key.DateModified,
                    EmailVerified = y.Key.EmailVerified,
                    IsAdmin = y.Key.IsAdmin
                }).ToList();

                retModel = groupUser.First();

                //group by beats
                retModel.UserBeatsList = profileList.Exists(x => x.BeatId==0) ? new List<UserBeats>() :
                    profileList.GroupBy(x => new
                {
                    x.BeatId,
                    x.BeatTitle,
                    x.BeatProducer,
                    x.BeatUploadDate,

                })
                   .Select(y => new UserBeats
                   {
                       Id = y.Key.BeatId,
                       Title = y.Key.BeatTitle,
                       Producer = y.Key.BeatProducer,
                       UploadDate = y.Key.BeatUploadDate
                   }).ToList();

                //group by lyrics
                retModel.UserLyricsList = profileList.Exists(x => x.LyricsId==0) ? new List<UserLyrics>() :                    
                    profileList.GroupBy(x => new
                {
                    x.LyricsId,
                    x.LyricsBeatId,
                    x.LyricsTitle,
                    x.LyricsProducer,
                    x.LyricsDateCreated
                })
                    .Select(y => new UserLyrics
                    {
                        Id = y.Key.LyricsId,
                        BeatId = y.Key.LyricsBeatId,
                        Title = y.Key.LyricsTitle,
                        Producer = y.Key.LyricsProducer,
                        UploadDate = y.Key.LyricsDateCreated
                    }).ToList();
            }
            catch (Exception e)
            {
               var check= e.InnerException.ToString();
            }

            return retModel;
        }

        public int UpdateUser(UsersUpdateRequest request, int id)
        {
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Users_Update";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserId", id);
                cmd.Parameters.AddWithValue("@Name", request.Name);
                cmd.Parameters.AddWithValue("@Email", request.Email);
                //cmd.Parameters.AddWithValue("@Paswword", request.Password);

                cmd.ExecuteNonQuery();

                conn.Close();
            }
            return id;
        }

        public int UpdatePassword(UsersUpdateRequest request)
        {
            int retId = 0;
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "User_Update_Password";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserId", request.Id);
                cmd.Parameters.AddWithValue("@Password", request.Password);

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

        public async Task EmailVerification(User request)
        {
            //var apiKey = Environment.GetEnvironmentVariable("NAME_OF_THE_ENVIRONMENT_VARIABLE_FOR_YOUR_SENDGRID_KEY");
            //var client = new SendGridClient(apiKey);
            //var from = new EmailAddress("noreply@lyrical.og", "Administrator");
            //var subject = "Email Validation for LyricalOG";
            //var to = new EmailAddress(request.Email, request.Name);
            //var plainTextContent = "Click Here to Validate your account";
            //string htmlContent = string.Format("<a href=\"{0}{1}\"> Click here to reset password</a>", request.VerificationLink, SecretPasswordKey);
            //var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            //var response = await client.SendEmailAsync(msg);
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