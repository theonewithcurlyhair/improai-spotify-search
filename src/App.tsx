import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
  IconButton,
} from '@mui/material';
// @ts-ignore () problems with package
import { TrackObjectFull, SimplifiedArtistObject } from 'spotify-api';
import * as querystring from "querystring";
import axios from "axios";

const spotifyApi = new SpotifyWebApi();

const SpotifySearch: React.FC = () => {
  const redirect_uri = 'http://localhost:3000';
  const client_id = 'c67ba72cf6fb472e8496ba981191be93';
  const client_secret = '3a3cbec28e92464d80197377246a692f';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<TrackObjectFull[]>([]);

  // Setting up access token from the authorization token from redirect and performing search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');   //getting authorization code from URL
    const data = {
      grant_type: 'authorization_code',
      code,
      redirect_uri,
    };

    const headers = {
      'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    axios.post('https://accounts.spotify.com/api/token', querystring.stringify(data), { headers })
        .then(response => {
          spotifyApi.setAccessToken(response.data.access_token);
        });

    if (searchQuery) {
      spotifyApi.searchTracks(searchQuery).then((data) => {
        setSearchResults(data.tracks.items);
      });
    }
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  }

  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds, 10).toString().padStart(2, '0')}`;
  };

  // Setting Up authorization for Spotify
  const handleAuthorizationClick = () => {
    const scope = 'user-read-private user-read-email';
    const authorizationUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scope}`;
    window.location.href = authorizationUrl;
  }

  return (
      <div style={{marginTop: '20px'}}>
        <form onSubmit={(e) => e.preventDefault()} style={{marginBottom: '20px'}}>
          <TextField
              label="Search for tracks"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: '10px' }}
          >
            Search
          </Button>
          <Button
              onClick={clearSearch}
              variant="contained"
              color="secondary"
              style={{ marginTop: '10px', marginLeft: '10px' }}
          >
            Clear
          </Button>
          <Button
              onClick={handleAuthorizationClick}
              variant="contained"
              color="warning"
              style={{ marginTop: '10px', marginLeft: '10px' }}
          >
            Authorize
          </Button>
        </form>
        <Grid container spacing={2}>
          {searchResults.map((track: TrackObjectFull) => (
              <Grid item key={track.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardMedia
                      component="img"
                      alt={track.name}
                      height="140"
                      image={track.album.images[0].url}
                  />
                  <CardContent>
                    <Typography variant="h6">
                      <Link
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                      >
                        {track.name}
                      </Link>
                    </Typography>
                    <Link
                        key={track.album.id}
                        href={track.album.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                      {track.album.name}
                    </Link>
                    {/* Wanted to use a map solution but it didn't work and resulted in [object Object], [object Object] etc*/}
                    {/*<Typography variant="body2">*/}
                    {/*  {track.artists.map((artist: any) => (*/}
                    {/*      <Link*/}
                    {/*          key={artist.id}*/}
                    {/*          href={artist.external_urls.spotify}*/}
                    {/*          target="_blank"*/}
                    {/*          rel="noopener noreferrer"*/}
                    {/*      >*/}
                    {/*        {artist.name}*/}
                    {/*      </Link>*/}
                    {/*  )).join(', ')}*/}
                    {/*</Typography>*/}
                    <Typography variant="body2">
                      {(() => {
                        const artistLinks: JSX.Element[] = [];
                        track.artists.forEach((artist: SimplifiedArtistObject) => {
                          artistLinks.push(
                              <Link
                                  key={artist.id}
                                  href={artist.external_urls.spotify}
                                  target="_blank"
                                  rel="noopener noreferrer"
                              >
                                {artist.name}
                              </Link>
                          );
                        });
                        return artistLinks.reduce((prev, curr) => (
                            <>
                              {prev}, {curr}
                            </>
                        ));
                      })()}
                    </Typography>
                    <Typography variant="body2">
                      Duration: {formatDuration(track.duration_ms)}
                    </Typography>
                    <audio controls><source src={track.preview_url} type="audio/mpeg" />Your browser does not support the audio element.</audio>
                  </CardContent>
                </Card>
              </Grid>
          ))}
        </Grid>
      </div>
  );
};

export default SpotifySearch;
