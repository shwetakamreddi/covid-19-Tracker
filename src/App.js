
import React, { useEffect, useState } from 'react'
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core'
import "./App.css"
import InfoBox from "./InfoBox"
import Map from "./Map"
import Table from './Table'
import { prettyPrintStat, sortData } from './utils'
import "leaflet/dist/leaflet.css"

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState("worldwide")
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data)
      })
  }, [])

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/countries")
      .then(response => response.json())
      .then(data => {
        setMapCountries(data)
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))
        setCountries(countries)
        const sortedData = sortData(data)
        setTableData(sortedData)
      })
  }, [])

  const onCountryChange = (e) => {
    const tempcountryName = e.target.value
    setCountry(tempcountryName)
    const url = tempcountryName === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${tempcountryName}`
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data)
        tempcountryName === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long])
      })
  }
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange}
              value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map((country) => (
                  <MenuItem key={country.name} value={country.name}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            active={casesType === "cases"}
            isRed
            title="Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={countryInfo.cases} />

          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            active={casesType === "recovered"}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={countryInfo.recovered} />

          <InfoBox onClick={(e) => setCasesType("deaths")}
            active={casesType === "deaths"}
            isRed
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={countryInfo.deaths} />
        </div>
        <div className="map">
          <Map center={mapCenter}
            zoom={mapZoom}
            countries={mapCountries}
            casesType={casesType}
          />
        </div>
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
        </CardContent>
      </Card>
    </div>
  )
}

export default App
