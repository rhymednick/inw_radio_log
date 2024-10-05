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

// Utility function to fetch all users
export async function getUsers(): Promise<User[] | undefined> {
    try {
        const response = await fetch(`${baseUrl}/api/admin/users`);
        if (!response.ok) {
            console.error('Error fetching users');
            return undefined;
        }
        const data = await response.json();
        return data.users;
    } catch (error) {
        console.error('Network error when fetching users:', error);
        return undefined;
    }
}

// Utility function to fetch a single user by ID
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

// Utility function to delete a user by ID
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

// Utility function to save a profile photo
export async function saveUserProfilePhoto(userName: string, base64Image: string): Promise<string | null> {
    const matches = base64Image.match(/^data:image\/jpeg;base64,(.+)$/);
    if (matches && matches.length === 2) {
        const imageBuffer = Buffer.from(matches[1], 'base64');
        const lowerCaseFileName = userName.toLowerCase(); // Convert to lowercase
        const imagePath = `/public/images/${lowerCaseFileName}.jpg`;

        try {
            await fetch(imagePath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: imageBuffer,
            });
            return `/images/${lowerCaseFileName}.jpg`; // Return relative URL
        } catch (error) {
            console.error('Error saving image:', error);
            return null;
        }
    }
    return null;
}

// Utility function to add or update a user
export async function addOrUpdateUser(user: User, profilePhoto?: string): Promise<string | undefined> {
    let savedImageUrl: string | null = null;

    if (profilePhoto) {
        savedImageUrl = await saveUserProfilePhoto(user.name, profilePhoto);
    }

    const requestBody = {
        ...user,
        profilePhoto: savedImageUrl || user.profilePhoto || '', // Handle partial success for image saving
    };

    try {
        const response = await fetch(`${baseUrl}/api/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error('Error adding/updating user');
            return undefined;
        }

        const data = await response.json();
        if (savedImageUrl === null && profilePhoto) {
            return `${data.message} (User saved, but profile photo upload failed)`;
        }

        return data.message;
    } catch (error) {
        console.error('Network error when adding/updating user:', error);
        return undefined;
    }
}
// Utility function to get radios
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
        console.log('Data:', data);
        // If parameters were specified, and one of them was radioID,
        // return a single radio object
        if (params && 'radioID' in params) {
            return data[0] as Radio;
        }
        // Otherwise, return an array
        return data as Radio[];
    } catch (error) {
        console.error('Network error when fetching radios:', error);
        return undefined;
    }
}

// Utility function to add a new radio
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

// Utility function to delete a radio by ID
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

// Utility function to check out a radio
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

// Utility function to check in a radio
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

// Utility function to report damage on a radio
export async function reportDamage(radioID: string, userName: string, comment: string): Promise<string | undefined> {
    const newComment = `Damage Report: ${comment}`;

    return appendRadioComment(radioID, userName, newComment);
}

// Utility function to report a radio as nonfunctional
export async function reportNonFunctional(
    radioID: string,
    userName: string,
    comment: string
): Promise<string | undefined> {
    const newComment = `Nonfunctional Report: ${comment}`;

    return appendRadioComment(radioID, userName, newComment);
}
// Utility function to append a comment to a radio
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

// Utility function to update the entire radio object by replacing it
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

// Utility function to add a new log entry
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
