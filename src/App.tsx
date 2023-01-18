import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import { parse } from 'csv-parse/sync';

function App() {
  const [queryBuoyId, setQueryBuoyId] = useState('');
  const [response, setResponse] = useState({
    buoyId: '',
    list: [],
    error: '',
    isNew: true
  });

  useEffect(() => {
    const getNOAAData = async (buoyId: string) => {

      if (buoyId.trim() === ''){
        setResponse({
          buoyId: '',
          list: [],
          error: '',
          isNew: true
        });
        return;
      }

      var url = `https://glympse-public.s3.amazonaws.com/assets/${buoyId}.txt`;

      try {
        const httpResponse = await fetch(url);

        if (!httpResponse.ok){

          //catch http errors
          if (httpResponse.status === 403){
            throw new Error('ERR_FORBIDDEN');
          }else{
            throw new Error('ERR_UNHANDLED');
          }
        }

        const text = await httpResponse.text();

        //do some format sanitization
        const cleanedText = text.replace(/\s\s+/g, ' ').trim().replace(/MM/gi, '-');
        const records = parse(cleanedText, {
          delimiter: ' ',
          from_line: 3
        });

        //parse datetime and generate a proper data record
        //dates are parsed as UTC and displayed using the browser's TZ

        const newRecords = records.map((val: any) => [
          new Date(
            Date.UTC(
              parseInt(val[0]),
              parseInt(val[1])-1,
              parseInt(val[2]),
              parseInt(val[3]),
              parseInt(val[4])
            )
          ),
          val[5],
          val[6],
          val[7],
          val[8],
          val[9],
          val[10],
          val[11],
          val[12],
          val[13],
          val[14],
          val[15],
          val[16],
          val[17],
          val[18],
        ]);

        setResponse({
          buoyId: buoyId,
          list: newRecords,
          error: '',
          isNew: false
        });

      }catch (error: any){
        //catches all data retrieval errors

        if (error.message === 'ERR_FORBIDDEN'){

          setResponse({
            buoyId: buoyId,
            list: [],
            error: 'ERR_FORBIDDEN',
            isNew: false
          });

        }else{
          //could be any other error, like a network error

          setResponse({
            buoyId: buoyId,
            list: [],
            error: 'ERR_UNHANDLED',
            isNew: false
          });
        }
      }
    }
  
    getNOAAData(queryBuoyId);
  }, [queryBuoyId]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setQueryBuoyId((event.target as HTMLInputElement).value);
    }
  };

  return (
    <div className="App">
        <div className="wrapper">
          <div className="search-wrapper">
            <label htmlFor="search-form">
              <span className="search-label">Buoy ID:</span>
              <input
                type="search"
                name="search-form"
                id="search-form"
                className="search-input"
                placeholder="Enter Buoy ID..."
                onKeyDown={handleKeyDown}
              />
            </label>
          </div>

          <div className="results-wrapper">
            {(queryBuoyId !== response.buoyId) ?
              <div className='search-fetching'>
                Retrieving data for buoy {queryBuoyId}...
              </div> : <div/>
            }
            {(response.error === '' && !response.isNew ?
              <div>
                <div className='search-results-title'>
                  Buoy {response.buoyId}
                </div>
                <table>
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Wind Direction</th>
                    <th>Wind Speed</th>
                    <th>GST</th>
                    <th>WVHT</th>
                    <th>DPD</th>
                    <th>APD</th>
                    <th>MWD</th>
                    <th>Pressure</th>
                    <th>ATMP</th>
                    <th>WTMP</th>
                    <th>Dew Point</th>
                    <th>Visibility</th>
                    <th>PTDY</th>
                    <th>Tide</th>
                  </tr>
                </thead>
                <tbody>
                {
                response.list.map((val: any, key: number) => (
                    <tr key={key}>
                      <td>{val[0].toString()}</td>
                      <td>{val[1]}</td>
                      <td>{val[2]}</td>
                      <td>{val[3]}</td>
                      <td>{val[4]}</td>
                      <td>{val[5]}</td>
                      <td>{val[6]}</td>
                      <td>{val[7]}</td>
                      <td>{val[8]}</td>
                      <td>{val[9]}</td>
                      <td>{val[10]}</td>
                      <td>{val[11]}</td>
                      <td>{val[12]}</td>
                      <td>{val[13]}</td>
                      <td>{val[14]}</td>
                    </tr>
                  ))
                }
                </tbody>
                </table>
              </div>
            :
              <div className='status-wrapper'>
                <div className='status-message'>
                  {(response.isNew ?
                    'Enter a Buoy Identifier (i.e.: LKWF1 or LMDF1).' : 
                    <div className='error-message'>
                      {response.error === 'ERR_FORBIDDEN' ?
                        'Unknown Buoy Identifier.' :
                        'There was an error with your search. Please retry.'
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

export default App;