import { IResponse } from "@thaias/pio_editor_meta";
import axios, { AxiosResponse } from "axios";

const VALIDATOR_API_URL: string = "http://validator:5212/";

/**
 * Sends xml string to backend for validation.
 * @param {string} xmlString Representing the PIO as string, which should be validated in backend
 * @returns {IResponse} Response from backend
 */
const validatePIO = async (xmlString: string): Promise<IResponse> => {
    try {
        return await axios
            .post(`${VALIDATOR_API_URL}validate`, xmlString, {
                headers: { "Content-Type": "text/xml" },
            })
            .then((response: AxiosResponse) => {
                return response.data as unknown as IResponse;
            });
    } catch (error) {
        let errorMessage: string = "Unknown error";
        if (error instanceof Error) errorMessage = error.message;
        return {
            success: false,
            message: "Validation failed due to following error: " + errorMessage,
        } as IResponse;
    }
};

export default { validatePIO };
