#import "ParkProAPIClient.h"
#import "AFJSONRequestOperation.h"
//static NSString * const kParkProAPIBaseURLString = @"http://evening-harbor-3676.herokuapp.com";
//static NSString * const kParkProAPIBaseURLString = @"http://powerful-taiga-1004.herokuapp.com";
//static NSString * const kParkProAPIBaseURLString = @"http://joinspots.com";
static NSString * const kParkProAPIBaseURLString = @"http://localhost:3000";

@implementation ParkProAPIClient

+ (ParkProAPIClient *)sharedClient {
    static ParkProAPIClient *_sharedClient = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedClient = [[self alloc] initWithBaseURL:[NSURL URLWithString:kParkProAPIBaseURLString]];
        [_sharedClient setParameterEncoding:AFJSONParameterEncoding];
    });
    
    return _sharedClient;
}

- (id)initWithBaseURL:(NSURL *)url {
    self = [super initWithBaseURL:url];
    if (!self) {
        return nil;
    }
    
    [self registerHTTPOperationClass:[AFJSONRequestOperation class]];
    [self setDefaultHeader:@"Accept" value:@"application/json"];
 

    
    return self;
}

#pragma mark - AFIncrementalStore

- (id)representationOrArrayOfRepresentationsFromResponseObject:(id)responseObject {
    
//    NSLog(@"Remote Response %@",[responseObject description]);

    
    return responseObject;
}

- (NSDictionary *)attributesForRepresentation:(NSDictionary *)representation 
                                     ofEntity:(NSEntityDescription *)entity 
                                 fromResponse:(NSHTTPURLResponse *)response {
    NSMutableDictionary *mutablePropertyValues = [[super attributesForRepresentation:representation ofEntity:entity fromResponse:response] mutableCopy];


    // Customize the response object to fit the expected attribute keys and values
    
//    NSLog(@"Remote OBJECT %@",[representation description]);

    return mutablePropertyValues;
}

- (BOOL)shouldFetchRemoteAttributeValuesForObjectWithID:(NSManagedObjectID *)objectID
                                 inManagedObjectContext:(NSManagedObjectContext *)context
{
    return NO;
}

- (BOOL)shouldFetchRemoteValuesForRelationship:(NSRelationshipDescription *)relationship
                               forObjectWithID:(NSManagedObjectID *)objectID
                        inManagedObjectContext:(NSManagedObjectContext *)context
{
    return NO;
}



@end
