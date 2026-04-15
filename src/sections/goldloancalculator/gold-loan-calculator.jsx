import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button, IconButton,
} from '@mui/material';
import { useGetCarat } from '../../api/carat';
import { useGetScheme } from '../../api/scheme';
import Iconify from '../../components/iconify';

function GoldLoanCalculator() {
  const { carat } = useGetCarat();
  const { scheme } = useGetScheme();
  const activeCarat = carat?.filter((item) => item.isActive) || [];
  const activeScheme = scheme?.filter((item) => item.isActive) || [];
  const [goldGramsTables, setGoldGramsTables] = useState([[{ netGram: 0, goldGram: '' }]]);
  const [financeTables, setFinanceTables] = useState([[{ netGram: '' }]]);
  const [totalsNetGram, setTotalsNetGram] = useState([0]);
  const [totalsFinance, setTotalsFinance] = useState([0]);

  const deleteTable = (tableIndex) => {
    if (goldGramsTables.length > 1) {
      setGoldGramsTables((prevTables) => prevTables.filter((_, index) => index !== tableIndex));
      setFinanceTables((prevTables) => prevTables.filter((_, index) => index !== tableIndex));
      setTotalsNetGram((prev) => prev.filter((_, index) => index !== tableIndex));
      setTotalsFinance((prev) => prev.filter((_, index) => index !== tableIndex));
    }
  };

  const handleNumericInput = (value) => value.replace(/[^0-9.]/g, '');

  const handleGoldGramChange = (tableIndex, rowIndex, value) => {
    const updatedTables = [...goldGramsTables];
    const caratPercentage = activeCarat[rowIndex]?.caratPercentage || 0;
    const netGram = ((Number(value) || 0) * caratPercentage) / 100;

    updatedTables[tableIndex][rowIndex] = {
      ...updatedTables[tableIndex][rowIndex],
      goldGram: value,
      netGram: netGram.toFixed(2),
    };
    setGoldGramsTables(updatedTables);

    const totalNetGram = updatedTables[tableIndex]
      .reduce((sum, row) => sum + Number(row.netGram || 0), 0)
      .toFixed(2);

    const updatedTotals = [...totalsNetGram];
    updatedTotals[tableIndex] = totalNetGram;
    setTotalsNetGram(updatedTotals);

    updateFinanceTablesNetGram(tableIndex, totalNetGram);
  };

  const updateFinanceTablesNetGram = (tableIndex, totalNetGram) => {
    const updatedFinanceTables = [...financeTables];

    updatedFinanceTables[tableIndex] = activeScheme.map((row, rowIndex) => ({
      ...updatedFinanceTables[tableIndex][rowIndex],
      netGram: totalNetGram,
    }));

    setFinanceTables(updatedFinanceTables);
  };

  const handleNetGramChange2 = (tableIndex, rowIndex, value) => {
    const updatedTables = [...financeTables];
    updatedTables[tableIndex][rowIndex] = {
      ...updatedTables[tableIndex][rowIndex],
      netGram: value,
    };
    setFinanceTables(updatedTables);
    calculateTotalFinance(updatedTables, tableIndex);
  };

  const calculateTotalFinance = (tables, tableIndex) => {
    const total = tables[tableIndex].reduce((sum, row, rowIndex) => {
      const ratePerGram = activeScheme[rowIndex]?.ratePerGram || 0;
      return sum + (Number(row.netGram) * ratePerGram);
    }, 0);

    const updatedTotals = [...totalsFinance];
    updatedTotals[tableIndex] = total.toFixed(2);
    setTotalsFinance(updatedTotals);
  };

  const addTable = () => {
    if (goldGramsTables.length < 3) {
      setGoldGramsTables((prevTables) => [...prevTables, [{ netGram: 0, goldGram: '' }]]);
      setFinanceTables((prevTables) => [
        ...prevTables,
        [{ netGram: totalsNetGram[totalsNetGram.length] || 0 }],
      ]);
      setTotalsNetGram((prev) => [...prev, 0]);
      setTotalsFinance((prev) => [...prev, 0]);
    }
  };

  const resetTables = () => {
    setGoldGramsTables([[{ netGram: 0, goldGram: '' }]]);
    setFinanceTables([[{ netGram: '' }]]);
    setTotalsNetGram([0]);
    setTotalsFinance([0]);
  };

  const sx = {
    color: (theme) => (theme.palette.mode === 'light' ? '#000' : ''),
    padding: '8px',
  };

  const renderTable = (rows, tableIndex, handleChange, dataTable, totals, type) => (
    <>
      <Box key={tableIndex} mb={1}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='subtitle1'>
            {type === 'gold' ? `Gold Calculator ${tableIndex + 1}` : `Finance Calculator ${tableIndex + 1}`}
          </Typography>
          {type === 'gold' &&
            <IconButton
              color='error'
              onClick={() => deleteTable(tableIndex)}
              disabled={goldGramsTables.length <= 1}
              sx={{
                visibility: goldGramsTables.length > 1 ? 'visible' : 'hidden',
              }}
            >
              <Iconify icon='oui:cross-in-circle-filled' />
            </IconButton>}
        </Box>
      </Box>
      <TableContainer component={Paper} key={tableIndex}>
        <Table>
          <TableHead>
            <TableRow>
              {type === 'gold' && (
                <>
                  <TableCell sx={sx}>Carat</TableCell>
                  <TableCell sx={sx}>Value</TableCell>
                  <TableCell sx={sx}>Gold Gram</TableCell>
                  <TableCell sx={sx}>Net Gram</TableCell>
                </>
              )}
              {type === 'finance' && (
                <>
                  <TableCell sx={sx}>No.</TableCell>
                  <TableCell sx={sx}>Scheme Name</TableCell>
                  <TableCell sx={sx}>Interest Rate</TableCell>
                  <TableCell sx={sx}>Per Gram</TableCell>
                  <TableCell sx={sx}>Net Gram</TableCell>
                  <TableCell sx={sx}>Total Finance</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {type === 'gold' && (
                  <>
                    <TableCell sx={{ padding: '8px' }}>{row.name}</TableCell>
                    <TableCell sx={{ padding: '8px' }}>{row.caratPercentage}</TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <TextField
                        sx={{ ' .css-aplpb4-MuiInputBase-input-MuiOutlinedInput-input': { p: 0.5 } }}
                        variant='outlined'
                        size='small'
                        value={dataTable[tableIndex][rowIndex]?.goldGram || ''}
                        onChange={(e) =>
                          handleChange(tableIndex, rowIndex, handleNumericInput(e.target.value))
                        }
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <TextField
                        sx={{ ' .css-aplpb4-MuiInputBase-input-MuiOutlinedInput-input': { p: 0.5 } }}
                        variant='outlined'
                        size='small'
                        value={dataTable[tableIndex][rowIndex]?.netGram || ''}
                        inputProps={{ readOnly: true }}
                      />
                    </TableCell>
                  </>
                )}
                {type === 'finance' && (
                  <>
                    <TableCell sx={{ padding: '8px' }}>{rowIndex + 1}</TableCell>
                    <TableCell sx={{ padding: '8px' }}>{row.name}</TableCell>
                    <TableCell sx={{ padding: '8px' }}>{row.interestRate}</TableCell>
                    <TableCell sx={{ padding: '8px' }}>{row.ratePerGram}</TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <TextField
                        sx={{ ' .css-aplpb4-MuiInputBase-input-MuiOutlinedInput-input': { p: 0.5 } }}
                        variant='outlined'
                        size='small'
                        value={dataTable[tableIndex][rowIndex]?.netGram || ''}
                        onChange={(e) =>
                          handleChange(tableIndex, rowIndex, handleNumericInput(e.target.value))
                        }
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      {dataTable[tableIndex][rowIndex]?.netGram && row.ratePerGram
                        ? (
                          Number(dataTable[tableIndex][rowIndex].netGram) *
                          Number(row.ratePerGram)
                        ).toFixed(2)
                        : ''}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {type === 'gold' && (
          <Box mt={1} textAlign='left'>
            <Typography variant='subtitle1'>Total Net Gram: {totals[tableIndex]}</Typography>
          </Box>
        )}
      </TableContainer>
    </>
  );

  return (
    <Box p={3}>
      <Box display='flex' justifyContent='space-between' textAlign='center'>
        <Typography variant='h6' gutterBottom>
          Gold Loan Calculator
        </Typography>
        <Box>
          <Button
            variant='contained'
            onClick={addTable}
            disabled={goldGramsTables.length >= 3}
          >
            Add Table
          </Button>
          <Button variant='outlined' onClick={resetTables} style={{ marginLeft: '10px' }}>
            Reset
          </Button>
        </Box>
      </Box>
      <Grid container spacing={1}>
        {goldGramsTables.map((_, tableIndex) => (
          <Grid item xs={12} md={4} key={tableIndex}>
            {renderTable(activeCarat, tableIndex, handleGoldGramChange, goldGramsTables, totalsNetGram, 'gold')}
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={1} mt={1}>
        {financeTables.map((_, tableIndex) => (
          <Grid item xs={12} md={4} key={tableIndex}>
            {renderTable(activeScheme, tableIndex, handleNetGramChange2, financeTables, totalsFinance, 'finance')}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default GoldLoanCalculator;
