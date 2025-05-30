
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, Plus, Trash, ChevronDown, ChevronRight, Video, FileText, File, BookOpen, Image } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: string;
  completed: boolean;
  description: string;
}

interface Module {
  id: number;
  title: string;
  description: string;
  completion: number;
  lessons: Lesson[];
}

interface EditableModuleProps {
  module: Module;
  onModuleUpdate: (updatedModule: Module) => void;
  resources: any[];
}

const mediaTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'text':
      return <FileText className="h-4 w-4" />;
    case 'pdf':
      return <File className="h-4 w-4" />;
    case 'image':
      return <Image className="h-4 w-4" />;
    case 'exercise':
      return <BookOpen className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const EditableModule = ({ module, onModuleUpdate, resources }: EditableModuleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedModule, setEditedModule] = useState<Module>({ ...module });
  const [showResourceSelector, setShowResourceSelector] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { hasRole } = useAuth();
  
  const canEdit = hasRole(["admin", "instructor"]);
  
  const handleTitleChange = (value: string) => {
    setEditedModule({ ...editedModule, title: value });
  };
  
  const handleDescriptionChange = (value: string) => {
    setEditedModule({ ...editedModule, description: value });
  };
  
  const handleLessonChange = (index: number, field: keyof Lesson, value: any) => {
    const updatedLessons = [...editedModule.lessons];
    updatedLessons[index] = { ...updatedLessons[index], [field]: value };
    setEditedModule({ ...editedModule, lessons: updatedLessons });
  };
  
  const addLesson = () => {
    const newLesson: Lesson = {
      id: `${module.id}-${editedModule.lessons.length + 1}`,
      title: "New Lesson",
      duration: "10 min",
      type: "text",
      completed: false,
      description: "Enter lesson description"
    };
    
    setEditedModule({
      ...editedModule,
      lessons: [...editedModule.lessons, newLesson]
    });
  };
  
  const removeLesson = (index: number) => {
    const updatedLessons = [...editedModule.lessons];
    updatedLessons.splice(index, 1);
    setEditedModule({ ...editedModule, lessons: updatedLessons });
  };
  
  const addResourceAsLesson = (resource: any) => {
    const resourceType = resource.type.startsWith('image/') 
      ? 'image' 
      : resource.type.startsWith('video/') 
        ? 'video' 
        : resource.type.startsWith('application/pdf') 
          ? 'pdf' 
          : 'text';
          
    const newLesson: Lesson = {
      id: `${module.id}-${editedModule.lessons.length + 1}-${resource.id}`,
      title: resource.name,
      duration: "N/A",
      type: resourceType,
      completed: false,
      description: `Resource added from course materials: ${resource.name}`
    };
    
    setEditedModule({
      ...editedModule,
      lessons: [...editedModule.lessons, newLesson]
    });
    setShowResourceSelector(false);
  };
  
  const saveChanges = () => {
    onModuleUpdate(editedModule);
    setIsEditing(false);
    toast({
      title: "Module Updated",
      description: "Your changes have been saved successfully."
    });
  };
  
  const cancelEditing = () => {
    setEditedModule({ ...module });
    setIsEditing(false);
  };
  
  // Learner View (Read-only view)
  if (!canEdit) {
    return (
      <div className="border rounded-lg overflow-hidden mb-4">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full"
        >
          <div className="p-4 bg-gray-50 flex items-center justify-between">
            <div>
              <CollapsibleTrigger className="flex items-center gap-2 hover:text-blue-600 transition-colors focus:outline-none">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div>
                  <h3 className="font-medium">{module.title}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </CollapsibleTrigger>
            </div>
          </div>
          
          <CollapsibleContent className="divide-y border-t">
            {module.lessons.map((lesson) => (
              <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-1 bg-blue-100 text-blue-600 mt-0.5">
                      {mediaTypeIcon(lesson.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {lesson.duration}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                          {lesson.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
  
  // Instructor/Admin View (Editable view)
  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <div className="p-4 bg-gray-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input 
                  value={editedModule.title} 
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="font-medium"
                />
                <Input 
                  value={editedModule.description} 
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  className="text-sm text-muted-foreground"
                />
              </div>
            ) : (
              <>
                <h3 className="font-medium">{module.title}</h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" variant="outline" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={saveChanges}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={addLesson}>
              <Plus className="h-3 w-3 mr-1" />
              Add Lesson
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowResourceSelector(!showResourceSelector)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add from Resources
            </Button>
          </div>
        )}
        
        {showResourceSelector && (
          <div className="mt-3 p-3 border rounded-md bg-white">
            <h4 className="text-sm font-medium mb-2">Select a resource to add</h4>
            {resources.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {resources.map((resource) => (
                  <div 
                    key={resource.id} 
                    className="p-2 border rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() => addResourceAsLesson(resource)}
                  >
                    <span className="text-sm">{resource.name}</span>
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No resources available. Add resources first.</p>
            )}
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="divide-y border-t">
          {editedModule.lessons.map((lesson, index) => (
            <div key={lesson.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Input 
                  value={lesson.title} 
                  onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                  className="font-medium"
                />
                <div className="flex gap-3">
                  <Input 
                    value={lesson.duration} 
                    onChange={(e) => handleLessonChange(index, 'duration', e.target.value)}
                    className="text-xs w-24"
                    placeholder="Duration"
                  />
                  <select
                    value={lesson.type}
                    onChange={(e) => handleLessonChange(index, 'type', e.target.value)}
                    className="text-xs border rounded px-2 py-1 h-10"
                  >
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                    <option value="pdf">PDF</option>
                    <option value="exercise">Exercise</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                <Input 
                  value={lesson.description} 
                  onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                  className="text-sm"
                  placeholder="Lesson description"
                />
              </div>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => removeLesson(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {!isEditing && (
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full"
        >
          <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-gray-100 border-t focus:outline-none">
            <span className="text-sm font-medium">View Lessons ({module.lessons.length})</span>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="divide-y border-t">
            {module.lessons.map((lesson) => (
              <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-1 bg-blue-100 text-blue-600 mt-0.5">
                      {mediaTypeIcon(lesson.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {lesson.duration}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                          {lesson.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default EditableModule;
