"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  idd: {
    root: string;
    suffixes: string[];
  };
  flags: {
    png: string;
    svg: string;
  };
}

interface CountryCode {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string, fullNumber: string) => void;
  className?: string;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  className = "",
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags');
        const data: Country[] = await response.json();
        
        const formattedCountries: CountryCode[] = data
          .filter(country => country.idd.root) // Filtrer les pays sans indicatif
          .map(country => ({
            name: country.name.common,
            code: country.cca2,
            dial_code: `${country.idd.root}${country.idd.suffixes?.[0] || ''}`,
            flag: country.flags.svg
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
        // Définir un pays par défaut (par exemple, le premier de la liste)
        if (formattedCountries.length > 0) {
          setSelectedCountry(formattedCountries[0]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filtrer les pays en fonction de la recherche
  const filteredCountries = useMemo(() => {
    return countries.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dial_code.includes(searchQuery)
    );
  }, [searchQuery, countries]);

  // Initialiser le numéro de téléphone à partir de la valeur fournie
  useEffect(() => {
    if (value && countries.length > 0) {
      const countryCode = countries.find((country) =>
        value.startsWith(country.dial_code)
      );
      if (countryCode) {
        setSelectedCountry(countryCode);
        setPhoneNumber(value.slice(countryCode.dial_code.length));
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value, countries]);

  // Gérer la sélection d'un pays
  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    const fullNumber = `${country.dial_code}${phoneNumber}`;
    onChange(phoneNumber, fullNumber);
  };

  // Gérer la saisie du numéro de téléphone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, "");
    setPhoneNumber(newNumber);
    if (selectedCountry) {
      const fullNumber = `${selectedCountry.dial_code}${newNumber}`;
      onChange(newNumber, fullNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className={`flex items-center border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md ${className}`}
      >
        <div className="relative">
          <button
            type="button"
            className="flex items-center px-3 py-2 space-x-2 text-gray-700 hover:bg-gray-50 rounded-l-md focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoading}
          >
            {selectedCountry && (
              <>
                <img 
                  src={selectedCountry.flag} 
                  alt={`${selectedCountry.name} flag`} 
                  className="w-5 h-4 object-cover"
                />
                <span>{selectedCountry.dial_code}</span>
              </>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-1 w-72 bg-white rounded-md shadow-lg">
              <div className="p-2 border-b">
                <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none text-sm"
                    placeholder="Rechercher un pays..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50 space-x-3"
                    onClick={() => handleCountrySelect(country)}
                  >
                    <img 
                      src={country.flag} 
                      alt={`${country.name} flag`} 
                      className="w-5 h-4 object-cover"
                    />
                    <span>{country.name}</span>
                    <span className="text-gray-500 ml-auto">{country.dial_code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className="flex-1 px-3 py-2 outline-none rounded-r-md"
          placeholder="Numéro de téléphone"
          disabled={isLoading}
        />
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};

export default PhoneInput;