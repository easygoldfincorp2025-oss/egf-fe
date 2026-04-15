import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import FormHelperText from '@mui/material/FormHelperText';

import { Upload, UploadBox, UploadAvatar } from '../upload';
import { Box } from '@mui/system';
import Iconify from '../iconify';
import React, { useEffect, useRef } from 'react';
import { Tooltip } from '@mui/material';

// ----------------------------------------------------------------------

export function RHFUploadAvatar({ name,setOpen2,setImageSrc,setOpen,camera,setFile, ...other }) {
  const { control } = useFormContext();
  const inputRef = useRef()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          {camera && <Box sx={{ textAlign: 'right',position:"relative" }}>
            <Tooltip title="Upload File" arrow={true}>
              <Iconify icon="fa:cloud-upload"  onClick={() => {
                // setOpen(true)
                inputRef.current.click();
              }} width={24} sx={{ color: 'gray', cursor: 'pointer' }} />
            </Tooltip>

            <input ref={inputRef} onChange={(e)=> {
              if(e.target.files.length){
                setFile(e.target.files[0])
                const blobUrl = URL.createObjectURL(e.target.files[0]); // Convert the file object to a Blob URL
                setImageSrc(blobUrl);
                setOpen(true)
              }
            }} style={{display:"none"}} type={'file'} />
          </Box>}
          <UploadAvatar  error={!!error} file={field.value} camera={camera} setOpen2={setOpen2} {...other} />
          {!!error && (
            <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}

RHFUploadAvatar.propTypes = {
  name: PropTypes.string,
};

// ----------------------------------------------------------------------

export function RHFUploadBox({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox files={field.value} error={!!error} {...other} />
      )}
    />
  );
}

RHFUploadBox.propTypes = {
  name: PropTypes.string,
};

// ----------------------------------------------------------------------

export function RHFUpload({ name, multiple, helperText, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) =>
        multiple ? (
          <Upload
            multiple
            accept={{ 'image/*': [] }}
            files={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText error={!!error} sx={{ px: 2 }}>
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        ) : (
          <Upload
            accept={{ 'image/*': [] }}
            file={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText error={!!error} sx={{ px: 2 }}>
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        )
      }
    />
  );
}

RHFUpload.propTypes = {
  helperText: PropTypes.string,
  multiple: PropTypes.bool,
  name: PropTypes.string,
};
