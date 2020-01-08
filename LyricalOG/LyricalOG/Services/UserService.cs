
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin.Security;
using LyricalOG.Interfaces;
using LyricalOG.Models;
using LyricalOG.Models.Users;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Security.Principal;
using Newtonsoft.Json;
using myCrudApp.Models.Users;
using myCrudApp.Services;

namespace LyricalOG.Services
{
    public class UserService : IUsersProvider
    {

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
                    if (reader.Read())//returns read if password matches in db
                    {
                        request.UserId = (int)reader["UserId"];
                        request.Name = (string)reader["Name"];
                        request.DateCreated = (DateTime)reader["DateCreated"];
                        request.IsAdmin = (bool)reader["IsAdmin"];
                        request.IsVerified = (bool)reader["EmailVerified"];
                        request.ImageUrl = ConvertFromDBVal<string>(reader["ImageUrl"])?? "";
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

            if (userInfo.UserId == 0) return "";

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

        public User Create(UsersCreateRequest request)
        {
            var retUser = new User();

            var sql = new SqlService();
            sql.AddParameter("@Name", request.Name);
            sql.AddParameter("@Email", request.Email);
            sql.AddParameter("@Password", request.Password);

            retUser.Id = (int)sql.ExecuteScalar("Users_Insert");
            retUser.Name = request.Name;
            retUser.Email = request.Email;

            return retUser;
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
                                ImageUrl = reader["ImageUrl"]== DBNull.Value ? "" : (string)reader["ImageUrl"],

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
                //possible refectoring required because data points to single user; no grouping required
                if (profileList.Count != 0)
                {
                    var groupUser = profileList.GroupBy(x => new
                    {
                        x.Id,
                        x.Password,
                        x.Name,
                        x.Email,
                        x.DateCreated,
                        x.DateModified,
                        x.EmailVerified,
                        x.IsAdmin,
                        x.ImageUrl
                    }).Select(y => new UserProfile
                    {
                        Id = y.Key.Id,
                        Password = y.Key.Password,
                        Name = y.Key.Name,
                        Email = y.Key.Email,
                        DateCreated = y.Key.DateCreated,
                        DateModified = y.Key.DateModified,
                        EmailVerified = y.Key.EmailVerified,
                        IsAdmin = y.Key.IsAdmin,
                        ImageUrl = y.Key.ImageUrl
                    }).ToList();

                    retModel = groupUser.First();

                    //group by beats
                    retModel.UserBeatsList = profileList.Exists(x => x.BeatId == 0) ? new List<UserBeats>() :
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


                    //group by lyrics if list exists
                    retModel.UserLyricsList = profileList.Exists(x => x.LyricsId == 0) ? new List<UserLyrics>() :
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
            }
            catch (Exception e)
            {
               var check= e.InnerException.ToString();
            }

            return retModel;
        }

        public UserUpdateResponse UpdateUser(UsersUpdateRequest request, int id)
        {
            var sqlProvider = new SqlService();
            var s3Ser = new S3Service();

            var sliceImgUrl = "";
            if (request.ImgFileType != null) sliceImgUrl = s3Ser.SignedUrlWithNoExpire(null);

            sqlProvider.AddParameter("@UserId", id);
            sqlProvider.AddParameter("@Name", request.Name);
            sqlProvider.AddParameter("@Email", request.Email);
            sqlProvider.AddParameter("@ImageUrl", sliceImgUrl);

            sqlProvider.ExecuteNonQuery("Users_Update");

            var user = new UserUpdateResponse
            {
                Id = id,
                ImageSignedUrl = s3Ser.GeneratePreSignedURL("UI" + id.ToString(), request.ImgFileType)
            };
            return user;
        }

        public bool UpdatePassword(UsersUpdateRequest request)
        {
            var sqlProvider = new SqlService();

            sqlProvider.AddParameter("@UserId", request.Id);
            sqlProvider.AddParameter("@Password", request.Password);
            sqlProvider.AddParameter("@NewPassword", request.NewPassword);

            return (bool)sqlProvider.ExecuteScalar("User_Update_Password");
        }

        public bool ValidateAccount(string key)
        {
            var sql = new SqlService();
            sql.AddParameter("@EmailVerified", true);
            sql.AddParameter("@VerificationKey", key);

            bool ret = sql.ExecuteScalar("User_Update_EmailVerified") == DBNull.Value ? false : true;
            return ret;
        }

        public bool PasswordReset(UsersUpdateRequest request)
        {
            var sql = new SqlService();
            sql.AddParameter("@UserId", request.Id);
            sql.AddParameter("@Password", request.Password);
            bool ret = sql.ExecuteScalar("Users_ResetPassword") == DBNull.Value ? false : true;
            
            return ret;
        }

        public int Delete(int id)
        {
            var sql = new SqlService();
            sql.AddParameter("@UserId", id);
            sql.ExecuteNonQuery("Users_Delete");

            return id;
        }

        private static T ConvertFromDBVal<T>(object obj)
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