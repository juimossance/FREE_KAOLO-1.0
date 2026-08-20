import axios from "axios";
export interface ChatResponse {
    answer: string;
}
export const sendMessage = async (
    message: string
): Promise<ChatResponse> => {

    const response = await axios.post<ChatResponse>(
        "http://localhost:8080/api/chat",
        { message }
    );

    return response.data;
};