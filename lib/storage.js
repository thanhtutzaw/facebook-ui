import { ref, deleteObject } from "firebase/storage";
import { storage } from '../lib/firebase'


// Create a reference to the file to delete
export function deleteStorage() {
    const desertRef = ref(storage, 'images/desert.jpg');

    // Delete the file

    deleteObject(desertRef).then(() => {
        console.log("File deleted successfully")
    }).catch((error) => {
        console.log(error)
        alert("Uh-oh, an error occurred!")
    });
}
