// useEffect(() => {
//     if (typeof window !== "undefined" && user) {
//         const scanner = new Html5QrcodeScanner(
//             "reader",
//             {
//                 qrbox: {
//                     width: 250,
//                     height: 250,
//                 },
//                 fps: 5,
//                 supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
//                 useBarCodeDetectorIfSupported: true,
//                 aspectRatio: 1.7777778,
//             },
//             false
//         );

//         scanner.render((decodedText: string) => onScanSuccess(decodedText), onScanError);

//         return () => {
//             scanner.clear().catch(console.error);
//         };
//     }
// }, [user]);

// const onScanSuccess = async (decodedText: string) => {
//     try {
//         const bottle: ScannedBottle = {
//             id: decodedText,
//             timestamp: new Date(),
//             binId: selectedBin,
//         };

//         setScannedBottles((prev) => [...prev, bottle]);

//         // if (isOnline) {
//         //     await addDoc(collection(db, "scannedBottles"), {
//         //         ...bottle,
//         //         userId: user?.uid,
//         //         timestamp: new Date(),
//         //     });
//         // }
//     } catch (error) {
//         console.error("Error processing scan:", error);
//     }
// };

// const scanner = new Html5QrcodeScanner(
//     "reader",
//     {
//         qrbox: {
//             width: 250,
//             height: 250,
//         },
//         fps: 5,
//         supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
//         useBarCodeDetectorIfSupported: true,
//         aspectRatio: 1.7777778,
//     },
//     false
// );

// const startScan = () => {
//     setIsScanning(true);
//     scanner.render((decodedText: string) => onScanSuccess(decodedText), onScanError);
// };

// const stopScan = () => {
//     setIsScanning(false);
// };

//const scannerCall = () => {
// const scanner = new Html5QrcodeScanner(
//     "reader",
//     {
//         qrbox: { width: 250, height: 250 },
//         fps: 5,
//         supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
//         useBarCodeDetectorIfSupported: true,
//         aspectRatio: 1.7777778,
//     },
//     false
// );
//scanner.render((decodedText: string) => onScanSuccess(decodedText), onScanError);
//};

// const onScanSuccess = (decodedText: string) => {
//     console.log(decodedText);
// };

// const onScanError = (error: any) => {
//     console.warn(error);
// };

// useEffect(() => {
//     scannerCall();
// }, [user]);
