import { apiFetch } from "./http";

export interface CvResponse {
  id?: number;
  fileName?: string;
  message?: string;
  uploadedAt?: string;
}

const cvService = {
  async importCv(
    freelancerId: number,
    file: File
  ): Promise<CvResponse> {
    const formData = new FormData();

    formData.append("file", file);

    return apiFetch<CvResponse>(
      `/freelancers/${freelancerId}/cv`,
      {
        method: "POST",
        body: formData,
      }
    );
  },

  async getCv(
    freelancerId: number
  ): Promise<Blob> {
    return apiFetch<Blob>(
      `/freelancers/${freelancerId}/cv`,
      {
        method: "GET",
      }
    );
  },

  async deleteCv(
    freelancerId: number
  ): Promise<void> {
    return apiFetch<void>(
      `/freelancers/${freelancerId}/cv`,
      {
        method: "DELETE",
      }
    );
  },
};

export default cvService;