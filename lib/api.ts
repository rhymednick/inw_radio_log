// File: /lib/api.ts

import { CheckoutLogEntry, Radio, User } from '@/types/types';
import { getBaseUrl } from './get-base-url';

// Store the base URL globally
const baseUrl = getBaseUrl();

//Interfaces for getting filtered list of anything by radioID or userID
interface GetByRadioID {
    radioID: string;
    userID?: never;
}

interface GetByUserID {
    userID: string;
    radioID?: never;
}
// Union type for the two possible query params
type GetByParams = GetByRadioID | GetByUserID;

/**
 * Utility function to fetch all users.
 * @returns A list of all users, sorted by name, or undefined if an error occurs.
 */
export async function getUsers(): Promise<User[] | undefined> {
    try {
        const response = await fetch(`${baseUrl}/api/admin/users`);
        if (!response.ok) {
            console.error('Error fetching users');
            return undefined;
        }
        const data = await response.json();
        const users: User[] = data.users;

        // Sort users by name before returning
        users.sort((a, b) => a.name.localeCompare(b.name));

        return users;
    } catch (error) {
        console.error('Network error when fetching users:', error);
        return undefined;
    }
}

/**
 * Utility function to fetch a single user by ID.
 * @param userID - The ID of the user to fetch.
 * @returns The user object or undefined if not found or an error occurs.
 */
export async function getUserById(userID: string): Promise<User | undefined> {
    try {
        const response = await fetch(`${baseUrl}/api/admin/users?userID=${userID}`);
        if (!response.ok) {
            console.error(`Error fetching user with ID ${userID}`);
            return undefined;
        }
        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Network error when fetching user by ID:', error);
        return undefined;
    }
}

/**
 * Utility function to delete a user by ID.
 * @param userID - The ID of the user to delete.
 * @returns A success message or undefined if an error occurs.
 */
export async function deleteUser(userID: string): Promise<string | undefined> {
    try {
        const response = await fetch(`${baseUrl}/api/admin/users`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: userID }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error deleting user:', errorData.error);
            return undefined;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Network error when deleting user:', error);
        return undefined;
    }
}

/**
 * Utility function to add a new user.
 * @param name - The name of the user to add.
 * @param profilePhoto - Optional base64 encoded profile photo.
 * @returns A success message or undefined if an error occurs.
 */
export async function addUser(name: string, profilePhoto?: string): Promise<string | undefined> {
    const requestBody: Partial<User> = {
        name,
    };
    if (profilePhoto) {
        requestBody.profilePhoto = profilePhoto; // Include profilePhoto only if it's provided
    }
    try {
        const response = await fetch(`${baseUrl}/api/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error('Error adding user');
            return undefined;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Network error when adding user:', error);
        return undefined;
    }
}

/**
 * Utility function to update an existing user.
 * @param id - The ID of the user to update.
 * @param name - Optional new name for the user.
 * @param profilePhoto - Optional base64 encoded profile photo.
 * @returns A success message or undefined if an error occurs.
 */
export async function updateUser(id: string, name?: string, profilePhoto?: string): Promise<string | undefined> {
    // Build the requestBody only with fields that are provided
    const requestBody: Partial<User> = {
        id, // Required for update
    };

    if (name) {
        requestBody.name = name; // Include name only if it's provided
    }

    if (profilePhoto) {
        requestBody.profilePhoto = profilePhoto; // Include profilePhoto only if it's provided
    }

    try {
        const response = await fetch(`${baseUrl}/api/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error('Error updating user');
            return undefined;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Network error when updating user:', error);
        return undefined;
    }
}

/**
 * Utility function to get radios.
 * @param params - Optional parameters to filter radios by radioID or userID.
 * @returns A list of radios or a single radio, or undefined if an error occurs.
 */
export async function getRadios(params?: GetByParams): Promise<Radio[] | Radio | undefined> {
    let url = `${baseUrl}/api/admin/radios`;

    // Build query params based on the provided arguments
    if (params) {
        if ('radioID' in params) {
            url += `?radioID=${params.radioID}`;
        } else if ('userID' in params) {
            url += `?userID=${params.userID}`;
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Error fetching radios');
            return undefined;
        }

        const data = await response.json();
        // If parameters were specified, and one of them was radioID,
        // return a single radio object
        if (params && 'radioID' in params) {
            return data[0] as Radio;
        }
        // Otherwise, return an array
        // Sort radios by ID before returning
        return sortRadios(data as Radio[]);
    } catch (error) {
        console.error('Network error when fetching radios:', error);
        return undefined;
    }
}

/**
 * Utility function to add a new radio.
 * @param ID - The ID of the radio to add.
 * @param Name - The name of the radio to add.
 * @returns A success message or undefined if an error occurs.
 */
export async function addRadio(ID: string, Name: string): Promise<string | undefined> {
    try {
        const response = await fetch(`${baseUrl}/api/admin/radios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ID, Name }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error adding radio:', errorData.error);
            return undefined;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Network error when adding radio:', error);
        return undefined;
    }
}

/**
 * Utility function to delete a radio by ID.
 * @param ID - The ID of the radio to delete.
 * @returns A success message or undefined if an error occurs.
 */
export async function deleteRadio(ID: string): Promise<string | undefined> {
    try {
        const response = await fetch(`${baseUrl}/api/admin/radios`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ID }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error deleting radio:', errorData.error);
            return undefined;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Network error when deleting radio:', error);
        return undefined;
    }
}

/**
 * Utility function to check out a radio.
 * @param radioID - The ID of the radio to check out.
 * @param userID - The ID of the user checking out the radio.
 * @param force - Whether to force checkout even if already checked out.
 * @returns A success message or undefined if an error occurs.
 */
export async function checkOutRadio(
    radioID: string,
    userID: string,
    force: boolean = false
): Promise<string | undefined> {
    try {
        const existingRadio = await getRadios({ radioID: radioID });
        if (existingRadio && (existingRadio as Radio).checked_out_user && !force) {
            console.error('Radio is already checked out.');
            return 'Radio is already checked out.';
        }

        // Log the payload being sent for debugging
        const payload = {
            ID: radioID,
            checked_out_user: userID,
            checkout_date: new Date().toISOString(),
        };
        console.log('Sending payload to check out radio:', JSON.stringify(payload));

        // Perform the request
        const response = await fetch(`${baseUrl}/api/admin/radios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Log the response status for debugging
        console.log('Response status:', response.status);

        if (!response.ok) {
            // Try to parse error response body for more details
            const errorBody = await response.text();
            console.error('Error checking out radio:', errorBody);
            return undefined;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Network error when checking out radio:', error);
        return undefined;
    }
}

/**
 * Utility function to check in a radio.
 * @param radioID - The ID of the radio to check in.
 * @returns A success message or undefined if an error occurs.
 */
export async function checkInRadio(radioID: string): Promise<string | undefined> {
    try {
        const response = await fetch(`${baseUrl}/api/admin/radios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ID: radioID,
                checked_out_user: null,
                checkout_date: null,
            }),
        });

        if (!response.ok) {
            console.error('Error checking in radio');
            return undefined;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Network error when checking in radio:', error);
        return undefined;
    }
}

/**
 * Utility function to report damage on a radio.
 * @param radioID - The ID of the radio.
 * @param userName - The name of the user reporting damage.
 * @param comment - The damage description.
 * @returns A success message or undefined if an error occurs.
 */
export async function reportDamage(radioID: string, userName: string, comment: string): Promise<string | undefined> {
    const newComment = `Damage Report: ${comment}`;
    return appendRadioComment(radioID, userName, newComment);
}

/**
 * Utility function to report a radio as nonfunctional.
 * @param radioID - The ID of the radio.
 * @param userName - The name of the user reporting it.
 * @param comment - The nonfunctional description.
 * @returns A success message or undefined if an error occurs.
 */
export async function reportNonFunctional(
    radioID: string,
    userName: string,
    comment: string
): Promise<string | undefined> {
    const newComment = `Nonfunctional Report: ${comment}`;
    return appendRadioComment(radioID, userName, newComment);
}

/**
 * Utility function to append a comment to a radio.
 * @param radioID - The ID of the radio.
 * @param userName - The name of the user appending the comment.
 * @param comment - The comment to append.
 * @returns A success message or undefined if an error occurs.
 */
export async function appendRadioComment(
    radioID: string,
    userName: string,
    comment: string
): Promise<string | undefined> {
    const radio = (await getRadios({ radioID: radioID })) as Radio;
    const timestamp = new Date().toLocaleString('en-US');

    const newComment = `[${timestamp} by ${userName}] ${comment}`;
    const updatedComment = `${radio.Comments ? radio.Comments + '\n' : ''}${newComment}`;

    // Update the radio object with the new comment
    radio.Comments = updatedComment;
    return updateRadio(radio);
}

/**
 * Utility function to update the entire radio object by replacing it.
 * @param radio - The radio object to update.
 * @returns A success message or undefined if an error occurs.
 */
export async function updateRadio(radio: Radio): Promise<string | undefined> {
    try {
        // First, delete the existing radio with the same ID
        const deleteResponse = await deleteRadio(radio.ID);
        if (!deleteResponse) {
            console.error('Error deleting existing radio');
            return undefined;
        }

        // Then, add the new radio object
        const addResponse = await addRadio(radio.ID, radio.Name);
        if (!addResponse) {
            console.error('Error adding the updated radio');
            return undefined;
        }

        // Add any other properties that aren't handled by addRadio
        await fetch(`${baseUrl}/api/admin/radios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(radio),
        });

        return 'Radio updated successfully';
    } catch (error) {
        console.error('Network error when updating radio:', error);
        return undefined;
    }
}

/**
 * Utility function to add a new log entry.
 * @param radioID - The ID of the radio involved in the operation.
 * @param userID - The ID of the user involved in the operation.
 * @param operation - The operation being logged.
 * @returns A success message or undefined if an error occurs.
 */
export async function addLogEntry(radioID: string, userID: string, operation: string): Promise<string | undefined> {
    try {
        const response = await fetch(`${baseUrl}/api/admin/checkout-log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ radioID, userID, operation }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error adding log entry:', errorData.error);
            return undefined;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Network error when adding log entry:', error);
        return undefined;
    }
}

/**
 * Utility function to get log entries.
 * @param params - Parameters to filter log entries by radioID or userID.
 * @returns A list of checkout log entries or undefined if an error occurs.
 */
export async function getLogEntries(params: GetByParams): Promise<CheckoutLogEntry[] | undefined> {
    let url = `${baseUrl}/api/admin/checkout-log`;

    // Build query params based on the provided arguments
    if ('radioID' in params) {
        url += `?radioID=${params.radioID}`;
    } else if ('userID' in params) {
        url += `?userID=${params.userID}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Error fetching log entries');
            return undefined;
        }

        const data: CheckoutLogEntry[] = await response.json();
        return data;
    } catch (error) {
        console.error('Network error when fetching log entries:', error);
        return undefined;
    }
}

/**
 * Utility function to sort radios by their ID.
 * Radio IDs are in the format "ModelNameIndex" (e.g., "TR01"), but the model may be blank.
 * Sort radios first by model name alphabetically, then by index numerically.
 * @param radios - The list of radios to sort.
 * @returns A sorted list of radios.
 */
function sortRadios(radios: Radio[]): Radio[] {
    return radios.sort((a, b) => {
        // Extract model and index for both radios
        const regex = /^([a-zA-Z]*)(\d+)$/;
        const [, modelA, indexA] = a.ID.match(regex) || ['', '', ''];
        const [, modelB, indexB] = b.ID.match(regex) || ['', '', ''];

        // Compare models alphabetically (empty string comes first)
        if (modelA !== modelB) {
            if (modelA === '') return -1; // Empty model comes first
            if (modelB === '') return 1;
            return modelA.localeCompare(modelB); // Compare alphabetically
        }

        // If models are the same, compare the index numerically
        return Number(indexA) - Number(indexB);
    });
}
