




import React, { useState ,useEffect } from 'react';
import { Box, Button, Input, Flex, Text, VStack, FormControl, Stack, Heading,Image } from '@chakra-ui/react';
import * as XLSX from 'xlsx';
// import image from '../../../src/assets/barrelImages/01.jpg';

interface FormData {
  serialNumber: string;
  partNumber: string;
  description: string;
  angleA: string;         // Angle A
  angleB: string;         // Angle B
  length: string;         // Length
  distA: string;          // Distance A
  distB: string;          // Distance B
  designer: string;       // Designer's name
  date: string;           // Date
  applicable: string; 
}

interface PopupProps {
  onClose: () => void;
  // onSubmit: (data: FormData[]) => void;
  onSubmit: (data: FormData[], barrelDataPop: any[]) => void; 
  imageName: string; 
  barrelDataPop: any[];
}

const Popup: React.FC<PopupProps> = ({ onClose, onSubmit ,imageName,barrelDataPop}) => {
  const [formData, setFormData] = useState<FormData[]>(
    Array.from({ length: 5 }, (_, index) => ({
      serialNumber: `${String(index + 1).padStart(2, '0')}`,
      partNumber: '',
      description: '',
      angleA: '',         // Angle A
      angleB: '',         // Angle B
      length: '',         // Length
      distA: '',          // Distance A
      distB: '',          // Distance B
      designer: '',       // Designer's name
      date: '',           // Date
      applicable: '',  
    }))
  );
  let imageName1 = imageName; // dynamically set the image name
  // let image1 ;
  let image1: string | undefined; // Explicitly type it as a string or undefined
  // let image1 = require(`../../../src/assets/barrelImages/${imageName1}.jpg`) || image ;
  try {
    image1 = require(`../../../src/assets/barrelImages/${imageName1}.jpg`);
  } catch (error) {
    console.error(`Error loading image: ${error}`);
    // console.log(`cannot fined the image ${imageName1}`);
    // image1 = image; // Fallback to default image
  }
  const [imageBase64, setImageBase64] = useState<string>('');

  // useEffect(() => {
  //   // Convert image to base64 when the component mounts
  //   const imagePath = require(`./images/01.jpg`); // Adjust to your image path
  //   fetch(imagePath)
  //     .then(response => response.blob())
  //     .then(blob => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         setImageBase64(reader.result as string); // store base64 data
  //       };
  //       reader.readAsDataURL(blob);
  //     })
  //     .catch(err => console.error('Error loading image:', err));
  // }, [imageName]);
  const handleChange = (index: number, field: keyof FormData, value: string) => {
    setFormData((prevData) =>
      prevData.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const exportToExcel = () => {
    // const formattedData = formData.map((row) => ({
      const formattedData = XLSX.utils.json_to_sheet(formData.map(row => ({
      'Serial Number': row.serialNumber,
      'Part Number': row.partNumber,
      'Description': row.description,
      // 'Image': imageBase64,     
    'Angle A': row.angleA,            // Angle A
    'Angle B': row.angleB,            // Angle B
    'Length': row.length,             // Length
    'Dist A': row.distA,              // Distance A
    'Dist B': row.distB,              // Distance B
    '': '',                           // Empty field
    'Designer': row.designer,         // Designer's name
    'Date': row.date,                 // Date
    'Applicable': row.applicable,     // Applicable field
    // }));
  })));
    // const worksheet = XLSX.utils.json_to_sheet(formattedData);
// console.log('iamge:',imageBase64)
    // Adjust column width for Part Number (17 digits)
  const wscols = [
  { wch: 15 }, // Serial Number column width
  { wch: 20 }, // Part Number column width, adjusted for 17 digits
  { wch: 30 }, // Description column width
  { wch: 10 }, // Angle A column width
  { wch: 10 }, // Angle B column width
  { wch: 10 }, // Length column width
  { wch: 10 }, // Dist A column width
  { wch: 10 }, // Dist B column width
  { wch: 10 }, // Empty field column width
  { wch: 15 }, // Designer column width
  { wch: 15 }, // Date column width
  { wch: 10 }, // Applicable column width
];
formattedData['!cols'] = wscols;

    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Data');

    // // Save the workbook as a file
    // XLSX.writeFile(workbook, 'form_data.xlsx');
    const workbook = XLSX.utils.book_new();
    // const barrelDataSheet = XLSX.utils.json_to_sheet(barrelDataPop);
    // const barrelDataSheet = XLSX.utils.json_to_sheet(barrelDataPop.map(row => ({
    //   'FinalOutput': row.finalOutput,
    //   'Part Numbers': row.partNumbers,
    //   'Descriptions': row.descriptions,
    //   'angleA': row.angleA
    // })));
    const barrelDataSheet = XLSX.utils.json_to_sheet(barrelDataPop.map(row => ({
     'Final Output': row.finalOutput ? row.finalOutput.slice(-12) : '', // Final Output at first position
      'Description': row.description || '', // Description after Final Output
      'Barrel1': row.barrel1 || '', // Barrel1 field
      'Barrel1A': row.barrel1A || '', // Barrel1A field
      'Barrel2': row.barrel2 || '', // Barrel2 field
      'Barrel3': row.barrel3 || '', // Barrel3 field
      'Barrel4': row.barrel4 || '', // Barrel4 field
      'Part Numbers': (Array.isArray(row.partNumbers) && row.partNumbers.length > 0) ? row.partNumbers.join(', ') : '', // Part Numbers check and join
      'Descriptions': (Array.isArray(row.descriptions) && row.descriptions.length > 0) ? row.descriptions.join(', ') : '', // Descriptions check and join
      'Angle A': (Array.isArray(row.angleA) && row.angleA.length > 0) ? row.angleA.join(', ') : '', // Angle A check and join
      'Angle B': (Array.isArray(row.angleB) && row.angleB.length > 0) ? row.angleB.join(', ') : '', // Angle B check and join
      'Length': (Array.isArray(row.length) && row.length.length > 0) ? row.length.join(', ') : '', // Length check and join
      'Dist A': (Array.isArray(row.distA) && row.distA.length > 0) ? row.distA.join(', ') : '', // Dist A check and join
      'Dist B': (Array.isArray(row.distB) && row.distB.length > 0) ? row.distB.join(', ') : '', // Dist B check and join
      'Designer': (Array.isArray(row.designer) && row.designer.length > 0) ? row.designer.join(', ') : '', // Designer check and join
      'Date': (Array.isArray(row.Date) && row.Date.length > 0) ? row.Date.join(', ') : '',

      'Applicable': (Array.isArray(row.applicable) && row.applicable.length > 0) ? row.applicable.join(', ') : '', // Applicable check and join
    })));
 

    const wscol = [
      { wch: 20 }, // Final Output column width
      { wch: 25 }, // Description column width (added after Final Output)
      { wch: 20 }, // Barrel1 column width
      { wch: 20 }, // Barrel1A column width
      { wch: 20 }, // Barrel2 column width
      { wch: 20 }, // Barrel3 column width
      { wch: 20 }, // Barrel4 column width
      { wch: 25 }, // Part Numbers column width
      { wch: 30 }, // Descriptions column width
      { wch: 15 }, // Angle A column width
      { wch: 15 }, // Angle B column width
      { wch: 15 }, // Length column width
      { wch: 15 }, // Dist A column width
      { wch: 15 }, // Dist B column width
      { wch: 20 }, // Designer column width
      { wch: 20 }, // Date column width
      { wch: 25 }, // Applicable column width
    ];
    
    barrelDataSheet['!cols'] = wscol;
    
    // Create an empty Sheet1 to maintain structure
    // const emptySheet = XLSX.utils.aoa_to_sheet([[]]);
    // XLSX.utils.book_append_sheet(workbook, emptySheet, 'Sheet1'); // Empty Sheet1
    XLSX.utils.book_append_sheet(workbook, barrelDataSheet, 'Sheet1');
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet2'); // Save data in Sheet2
    XLSX.utils.book_append_sheet(workbook, formattedData, 'Sheet2'); // Save data in Sheet2
    
    // Save the workbook as a file
    XLSX.writeFile(workbook, 'form_data.xlsx');
  };


  const handleSubmit = () => {
   

    const isAnyFieldFilled = formData.some(
      (row) => row.partNumber.trim() !== '' || row.description.trim() !== ''
    );

    if (!isAnyFieldFilled) {
      alert('Please fill in at least one field before downloading.');
      return;
    }
    const isValid = formData
      .filter((row) => row.partNumber.trim() !== '') // Only check rows where Part Number is filled
      .every(
        (row) => row.partNumber.length === 12 // Check if Part Number has exactly 12 characters
      );

    if (!isValid) {
      alert('Please ensure all fields are correctly filled (12 digits for Part Number).');
      return;
    }
    // console.log('barreldatapopup in popup:',barrelDataPop);
    exportToExcel(); // Export to Excel only when the form is valid
    onSubmit(formData,barrelDataPop); // Send data to the parent
    onClose(); // Close the popup
  };

  const handleAddRows = () => {
    setFormData((prevData) => [
      ...prevData,
      ...Array.from({ length: 5 }, (_, index) => ({
        serialNumber: `${String(prevData.length + index + 1).padStart(2, '0')}`,
        partNumber: '',
        description: '',
        angleA: '',           // Angle A
        angleB: '',           // Angle B
        length: '',           // Length
        distA: '',            // Distance A
        distB: '',            // Distance B
        designer: '',         // Designer's name
        date: '',             // Date
        applicable: '',       // Applicable field
      }))
    ]);
  };

  return (
    <Box
      position="fixed"
      top="0px"
      left="0"    
      height="100%"
      width="100%"
      backgroundColor="rgba(0, 0, 0, 0.5)"
      display="flex"
      justifyContent="center"
      alignItems="center"
      zIndex="1000"
    >
      <Box
        backgroundColor="white"
        p="20px"
        borderRadius="8px"
        textAlign="center"
        boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"
        // width="1000px"
        width='80%'
        height="auto"
      
        // marginTop={'10px'}
      >
        {/* <Image src={image1 || image} alt="Popup"  padding={'0'} marginTop="-20px" marginBottom="20px" /> */}
   
        {(image1 ) && (
  <Image 
    src={image1 } 
    alt="Popup" 
    padding="0" 
    marginTop="-20px" 
    marginBottom="20px" 
    width="80%"

  />
)}
        {/* <Text fontSize="xl" mb="4" >
          Enter Details
        </Text> */}
        <Heading as={'h4'}
          fontSize={'14'}
          height={'44px'} lineHeight={'44px'}
          color={'#fff'}
          bgColor={'color.700'}
          pl={'4'}
          m="-20px"
          mb="20px"
          display={'flex'}
          justifyContent={'space-around'}
          flexDirection={['column', 'row', 'row', 'row']}
          flexWrap={'wrap'}

        >
          {/* <h1>Enter Details {imageName}</h1> */}
          <h1>Enter Details </h1>
        </Heading>

        {/* <Text fontSize="18px" mb="4" fontWeight="700" color="#000">
  Enter Details
</Text> */}
{/* */}
{/* <Flex fontWeight="bold" mb="4" alignItems="center">
  <Text flex="1" textAlign="center">Serial Number</Text>
  <Text flex="1" textAlign="center">Part Number (17 Digits)</Text>
  <Text flex="1" textAlign="center">Description</Text>
</Flex>


<VStack spacing="1" align="stretch" maxH="300px" overflowY="auto">
  {formData.map((row, index) => (
    <Flex key={index} justify="space-between" align="center" mb="4">
      <Box flex="1">
        <Input
          type="text"
          value={row.serialNumber}
          isReadOnly
          variant="filled"          
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Part Number"
          value={row.partNumber}
          maxLength={17}
          onChange={(e) =>
            handleChange(index, 'partNumber', e.target.value)
          }
          _placeholder={{
            textAlign: 'center', // Center the placeholder text only
          }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Description"
          value={row.description}
          onChange={(e) =>
            handleChange(index, 'description', e.target.value)
          }
          _placeholder={{
            textAlign: 'center', // Center the placeholder text only
          }}// Center the text (including value) for Description
        />
      </Box>
    </Flex>
  ))}
</VStack> */}
{/* */}


{/* 
<Flex fontWeight="bold" mb="4" alignItems="center">
  <Text flex="1" textAlign="center">Serial Number</Text>
  <Text flex="1" textAlign="center">Part Number (17 Digits)</Text>
  <Text flex="1" textAlign="center">Description</Text>
  <Text flex="1" textAlign="center">Angle A</Text>
  <Text flex="1" textAlign="center">Angle B</Text>
  <Text flex="1" textAlign="center">Length</Text>
  <Text flex="1" textAlign="center">Dist A</Text>
  <Text flex="1" textAlign="center">Dist B</Text>
  <Text flex="1" textAlign="center">Designer</Text>
  <Text flex="1" textAlign="center">Date</Text>
  <Text flex="1" textAlign="center">Applicable</Text>
</Flex>

<VStack spacing="1" align="stretch" maxH="200px" overflowY="auto">
  {formData.map((row, index) => (
    <Flex key={index} justify="space-between" align="center" mb="2">
      <Box flex="1">
        <Input
          type="text"
          value={row.serialNumber}
          isReadOnly
          variant="filled"          
        />
      </Box>
     
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Part Number"
          value={row.partNumber}
          maxLength={17}
          onChange={(e) =>
            handleChange(index, 'partNumber', e.target.value)
          }
          _placeholder={{
            textAlign: 'center', // Center the placeholder text only
          }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Description"
          value={row.description}
          onChange={(e) =>
            handleChange(index, 'description', e.target.value)
          }
          _placeholder={{
            textAlign: 'center', // Center the placeholder text only
          }}// Center the text (including value) for Description
        />
      </Box>
     
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Angle A"
          value={row.angleA}
          onChange={(e) =>
            handleChange(index, 'angleA', e.target.value)
          }
          _placeholder={{
            textAlign: 'center',
          }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Angle B"
          value={row.angleB}
          onChange={(e) =>
            handleChange(index, 'angleB', e.target.value)
          }
          _placeholder={{
            textAlign: 'center',
          }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Length"
          value={row.length}
          onChange={(e) =>
            handleChange(index, 'length', e.target.value)
          }
          _placeholder={{
            textAlign: 'center',
          }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Dist A"
          value={row.distA}
          onChange={(e) =>
            handleChange(index, 'distA', e.target.value)
          }
          _placeholder={{
            textAlign: 'center',
          }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Dist B"
          value={row.distB}
          onChange={(e) =>
            handleChange(index, 'distB', e.target.value)
          }
          _placeholder={{
            textAlign: 'center',
          }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Designer"
          value={row.designer}
          onChange={(e) =>
            handleChange(index, 'designer', e.target.value)
          }
          _placeholder={{
            textAlign: 'center',
          }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Date"
          value={row.date}
          onChange={(e) =>
            handleChange(index, 'date', e.target.value)
          }
          _placeholder={{
            textAlign: 'center',
          }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Applicable"
          value={row.applicable}
          onChange={(e) =>
            handleChange(index, 'applicable', e.target.value)
          }
          _placeholder={{
            textAlign: 'center',
          }}
        />
      </Box>
    </Flex>
  ))}
</VStack> */}
<Flex fontWeight="bold" mb="4" alignItems="center">
  <Text flex="0.5" textAlign="center">SlNo</Text>
  <Text flex="1" textAlign="center">Part Number</Text>
  <Text flex="1" textAlign="center">Description</Text>

  {image1 && (
    <>
      <Text flex="1" textAlign="center">Angle A</Text>
      <Text flex="1" textAlign="center">Angle B</Text>
      <Text flex="1" textAlign="center">Length</Text>
      <Text flex="1" textAlign="center">Dist A</Text>
      <Text flex="1" textAlign="center">Dist B</Text>
      <Text flex="1" textAlign="center">Designer</Text>
      <Text flex="1" textAlign="center">Date</Text>
      <Text flex="1" textAlign="center">Applicable</Text>
    </>
  )}
</Flex>

<VStack spacing="1" align="stretch" maxH="200px" overflowY="auto">
  {formData.map((row, index) => (
    <Flex key={index} justify="space-between" align="center">
      <Box flex="0.5">
        <Input type="text" value={row.serialNumber} isReadOnly variant="filled" />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Part Number"
          value={row.partNumber}
          maxLength={12}
          onChange={(e) => handleChange(index, 'partNumber', e.target.value)}
          _placeholder={{ textAlign: 'center' }}
        />
      </Box>
      <Box flex="1" ml="2">
        <Input
          type="text"
          placeholder="Enter Description"
          value={row.description}
          onChange={(e) => handleChange(index, 'description', e.target.value)}
          _placeholder={{ textAlign: 'center' }}
        />
      </Box>

      {image1 && (
        <>
          <Box flex="1" ml="2">
            <Input
              type="text"
              placeholder="Enter Angle A"
              value={row.angleA}
              onChange={(e) => handleChange(index, 'angleA', e.target.value)}
              _placeholder={{ textAlign: 'center' }}
            />
          </Box>
<Box flex="1" ml="2">
            <Input
              type="text"
              placeholder="Enter Angle B"
              value={row.angleB}
              onChange={(e) => handleChange(index, 'angleB', e.target.value)}
              _placeholder={{ textAlign: 'center' }}
            />
          </Box>
          <Box flex="1" ml="2">
            <Input
              type="text"
              placeholder="Enter Length"
              value={row.length}
              onChange={(e) => handleChange(index, 'length', e.target.value)}
              _placeholder={{ textAlign: 'center' }}
            />
          </Box>
          <Box flex="1" ml="2">
            <Input
              type="text"
              placeholder="Enter Dist A"
              value={row.distA}
              onChange={(e) => handleChange(index, 'distA', e.target.value)}
              _placeholder={{ textAlign: 'center' }}
            />
          </Box>
          <Box flex="1" ml="2">
            <Input
              type="text"
              placeholder="Enter Dist B"
              value={row.distB}
              onChange={(e) => handleChange(index, 'distB', e.target.value)}
              _placeholder={{ textAlign: 'center' }}
            />
          </Box>
          <Box flex="1" ml="2">
            <Input
              type="text"
              placeholder="Enter Designer"
              value={row.designer}
              onChange={(e) => handleChange(index, 'designer', e.target.value)}
              _placeholder={{ textAlign: 'center' }}
            />
          </Box>
          <Box flex="1" ml="2">
            <Input
              type="text"
              placeholder="Enter Date"
              value={row.date}
              onChange={(e) => handleChange(index, 'date', e.target.value)}
              _placeholder={{ textAlign: 'center' }}
            />
          </Box>
          <Box flex="1" ml="2">
            <Input
              type="text"
              placeholder="Enter Applicable"
              value={row.applicable}
              onChange={(e) => handleChange(index, 'applicable', e.target.value)}
              _placeholder={{ textAlign: 'center' }}
            />
          </Box>
        </>
      )}
    </Flex>
  ))}
</VStack>


        {/* <Button colorScheme="blue" onClick={handleAddRows} mt="4">
          + Add 5 More Rows
        </Button> */}
    
        <Button
            height="48px"
            w="48%"
            // border="1px solid #7FBF28"
             bg="#007bff"
            color="#fff"
            _hover={{ bg: "#007bff" }}
            _focus={{ bg: "#007bff" }}
            variant="solid"
            onClick={handleAddRows}
          >
          Add 5 Rows
          </Button>
        {/* <Flex justify="space-between" mt="4">
          <Button colorScheme="red" onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="green" onClick={handleSubmit}>
            Submit
          </Button>
        </Flex> */}
        <Flex justify="space-between" mt="4">
          <Button
            height="48px"
            w="48%"
            border="1px solid #7FBF28"
            bg="#fff"
            color="#7FBF28"
            _hover={{ bg: "#fff" }}
            _focus={{ bg: "#fff" }}
            variant="solid"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            height="48px"
            w="48%"
            bg="#7FBF28"
            color="#fff"
            _hover={{ bg: "#7FBF28" }}
            _focus={{ bg: "#7FBF28" }}
            variant="solid"
             type="button"
            onClick={handleSubmit}
          >
            Download
          </Button>
        </Flex>

      </Box>
    </Box>
  );
};

export default Popup;