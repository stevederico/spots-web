#import "AFIncrementalStore.h"
#import "AFRestClient.h"
#import "SSKeychain.h"
#import "AppDelegate.h"
@interface ParkProAPIClient : AFRESTClient <AFIncrementalStoreHTTPClient>

+ (ParkProAPIClient *)sharedClient;

@end
