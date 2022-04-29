## Notes
1- The db model for a url check (responsible for monitoring the website availability) is called Monitor.

2- The first request to an added url is made upon Monitor creation. After that, each request schedules the upcoming request based on the Monitor's interval.

3- Up/down time is updated on each request based on the previous state. This is to avoid updating it based solely on the interval field that might get updated by the user.

4- If the assert field is added, a request of status equal to assert.statusCode is considered successful and thus the url is considered up.

5- Failed url requests where the url is not found, are assigned 404 status.

### Requirements not handled - because of limited time -:
1- Consistency assertion between Url, path, port and protocol on db level.

2- Upon user updating a monitor interval a url request should be made if the new interval is smaller than the previous. Previous scheduled request should also be cancelled if possible.

3- Tcp requests.

4- Stateless authentication.

5- Signup email verification