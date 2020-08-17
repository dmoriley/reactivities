using System.Threading.Tasks;

namespace Application.Profiles
{
    public interface IProfileReader
    {
        Task<ProfileDto> ReadProfile(string username);
    }
}
