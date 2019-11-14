using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using LyricalOG.Interfaces;
using LyricalOG.Models;
using myCrudApp.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace LyricalOG.Services
{
    public class LyricService : ILyricsProvider
    {
        readonly string connString = ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
        readonly string accessKey = ConfigurationManager.AppSettings["S3_AccessKeyId"];                     //get S3 Access Key Id from web.config
        readonly string secretKey = ConfigurationManager.AppSettings["S3_SecretAccessKey"];                 //get S3 secret Key from web.config

        private const string bucketName = "lyricalog";
        private static readonly RegionEndpoint bucketRegion = RegionEndpoint.USWest1;                       //s3 region N California
        private static IAmazonS3 s3Client;

        public LyricsCreateResponse Create(LyricsCreateRequest request)
        {
            int id = 0;
            var response = new LyricsCreateResponse();
            var slicedUrl = SignedUrlWithNoExpire(request.File);

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Insert";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Lyrics", request.Lyrics);
                cmd.Parameters.AddWithValue("@Votes", 0);
                cmd.Parameters.AddWithValue("@UserId", request.UserId);
                cmd.Parameters.AddWithValue("@S3SignedUrl", slicedUrl);
                cmd.Parameters.AddWithValue("@BeatId", request.BeatId);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        id = Convert.ToInt32(reader["LyricsId"]);
                    }
                    reader.Close();
                }
                conn.Close();
            }
            var signedURL = GeneratePreSignedURL(id.ToString(), request.ContentType);  //get signedURL to update resumeUrl in S3
            response.LyricId = id;
            response.SignedUrl = signedURL;
            return response;
        }
        public string SignedUrlWithNoExpire(string fileName)
        {
            return "https://lyricalog.s3.us-west-1.amazonaws.com/" + fileName + "?AWSAccessKeyId="+ accessKey;
        }
        public string GeneratePreSignedURL(string fileName, string contentType)
        {
            AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
            s3Client = new AmazonS3Client(credentials, bucketRegion);

            GetPreSignedUrlRequest request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = fileName,
                ContentType = contentType,
                Verb = HttpVerb.PUT,
                Expires = DateTime.Now.AddDays(15)
            };

            string url = s3Client.GetPreSignedURL(request);
            return url;
        }

        public List<Lyrics> ReadAll()
        {
            var lyrics = new List<Lyrics>();

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_SelectAll";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var lyric = new Lyrics()
                        {
                            Id = (int)reader["Id"],
                            UserId=(int)reader["UserId"],
                            Lyric = (string)reader["Lyrics"],
                            Votes = (int)reader["Votes"]
                        };
                        lyrics.Add(lyric);
                    }
                    conn.Close();
                }
            }
            return lyrics;
        }

        public Lyrics ReadById(int id)
        {
            var lyrics = new Lyrics();

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Select_ById";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserId", id);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var lyric = new Lyrics()
                        {
                            Id = (int)reader["Id"],
                            UserId = (int)reader["UserId"],
                            Lyric = (string)reader["Lyrics"],
                            Votes = (int)reader["Votes"]
                        };
                        lyrics = lyric;
                    }
                }
                conn.Close();
            }
            return lyrics;
        }

        public List<Lyrics> ReadByBeatId(int BeatId)
        {
            var Users = new List<Lyrics>();

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Select_BeatId";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@BeatId", BeatId);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var lyrics = new Lyrics()
                        {
                            Id = Convert.ToInt32(reader["LyricsId"]),
                            UserId = Convert.ToInt32(reader["UserId"]),
                            BeatId = Convert.ToInt32(reader["BeatId"]),
                            Lyric = (string)reader["Lyrics"],
                            Votes = Convert.ToInt32(reader["Votes"]),
                            VoteCount = Convert.ToInt32(reader["VoteCount"]),
                            VoterId = (int)(reader["VoterId"]),
                            BeatUrl = (string)reader["BeatUrl"],
                            S3SignedUrl = (string)reader["S3SignedUrl"],

                            DateCreated = (DateTime)reader["DateCreated"],
                            DateModified = (DateTime)reader["DateModified"],
                            
                            Name = (string)reader["Name"],
                            Email = (string)reader["Email"],
                            Password = (string)reader["Password"],
                        };
                        Users.Add(lyrics);
                    }

                    conn.Close();
                }
            }
            var groupResult = Users.GroupBy(x => new
            {
                x.Id,
                x.UserId,
                x.BeatId,
                x.Lyric,
                x.VoteCount,
                x.BeatUrl,
                x.S3SignedUrl,
                x.DateCreated,
                x.DateModified,

                x.Name,
                x.Email,
                x.Password
            })
            .Select(y => new Lyrics
             {
                 Id = y.Key.Id,
                UserId = y.Key.UserId,
                BeatId = y.Key.BeatId,
                User = new User
                {
                    Id = y.Key.UserId,
                    Name = y.Key.Name,
                    Password = y.Key.Password,
                    Email = y.Key.Email
                },
                Lyric = y.Key.Lyric,
                VoteCount = y.Key.VoteCount,
                BeatUrl = y.Key.BeatUrl,
                S3SignedUrl = y.Key.S3SignedUrl,
                DateCreated = y.Key.DateCreated,
                DateModified = y.Key.DateModified,

                VoterList = y.Select(z => z.VoterId).ToList()    //list of voters
             }).ToList();

            groupResult = groupResult.OrderByDescending(u => u.VoteCount).ToList();

            return groupResult;
        }
        public int UpdateLyrics(LyricsUpdateRequest request, int id)
        {
            int retId = 0;
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Update";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@LyricsId", id);
                cmd.Parameters.AddWithValue("@Lyrics", request.Lyrics);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        retId = (int)reader["LyricsId"];
                    }
                }
                conn.Close();
            }
            return retId;
        }

        public int UpdateVotes(VoteRequest vote)
        {
            int retId = 0;
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Votes_Insert";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@LyricsId", vote.LyricsId);
                cmd.Parameters.AddWithValue("@UserId", vote.VoterId);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        retId = (int)reader["VoteId"];
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
                cmd.CommandText = "Lyrics_Delete";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@LyricsId", id);
                cmd.ExecuteNonQuery();

                conn.Close();
            }
            return id;
        }

    }
}