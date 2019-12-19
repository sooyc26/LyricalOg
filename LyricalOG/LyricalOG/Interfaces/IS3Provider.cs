using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LyricalOG.Interfaces
{
    public interface IS3Provider
    {
        int DeleteObjectNonVersionedBucketAsync(string objName);
        string GeneratePreSignedURL(string fileName, string contentType);
        string SignedUrlWithNoExpire(string fileName);
    }
}
