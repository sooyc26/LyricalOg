using LyricalOG.Models;
using myCrudApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LyricalOG.Interfaces
{
    public interface ILyricsProvider
    {
         LyricsCreateResponse Create(LyricsCreateRequest request);
         List<Lyrics> ReadAll();
        Lyrics ReadById(int id);
        List<Lyrics> ReadByBeatId(int BeatId);
        int VoteUp(VoteRequest vote);
        int DeleteVote(VoteRequest vote);
        int Delete(int id);
    }
}
