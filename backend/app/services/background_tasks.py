import asyncio
import logging
import functools
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Callable, Awaitable, List, Optional
import uuid

from ..core.logging import get_logger

logger = get_logger("background_tasks")

class BackgroundTaskManager:
    """Manages background tasks for long-running operations"""
    
    def __init__(self):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.executor = ThreadPoolExecutor(max_workers=4)
        self._lock = threading.RLock()
    
    def create_task(self, func: Callable, *args, **kwargs) -> str:
        """
        Create a new background task
        
        Args:
            func: Function to execute in the background
            *args: Positional arguments for the function
            **kwargs: Keyword arguments for the function
            
        Returns:
            task_id: Unique identifier for the task
        """
        task_id = str(uuid.uuid4())
        
        with self._lock:
            self.tasks[task_id] = {
                "id": task_id,
                "status": "pending",
                "created_at": time.time(),
                "started_at": None,
                "completed_at": None,
                "result": None,
                "error": None
            }
        
        # Wrap function to update task status
        def wrapped_func():
            try:
                with self._lock:
                    if task_id not in self.tasks:
                        logger.warning(f"Task {task_id} was cancelled before starting")
                        return
                    
                    self.tasks[task_id]["status"] = "running"
                    self.tasks[task_id]["started_at"] = time.time()
                
                logger.info(f"Starting background task {task_id}")
                result = func(*args, **kwargs)
                
                with self._lock:
                    if task_id in self.tasks:
                        self.tasks[task_id]["status"] = "completed"
                        self.tasks[task_id]["completed_at"] = time.time()
                        self.tasks[task_id]["result"] = result
                
                logger.info(f"Background task {task_id} completed successfully")
                return result
            
            except Exception as e:
                logger.error(f"Background task {task_id} failed: {str(e)}")
                
                with self._lock:
                    if task_id in self.tasks:
                        self.tasks[task_id]["status"] = "failed"
                        self.tasks[task_id]["completed_at"] = time.time()
                        self.tasks[task_id]["error"] = str(e)
                
                raise
        
        # Submit task to executor
        future = self.executor.submit(wrapped_func)
        
        return task_id
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get the status of a task
        
        Args:
            task_id: Task identifier
            
        Returns:
            Task status information
        """
        with self._lock:
            if task_id not in self.tasks:
                raise ValueError(f"Task {task_id} not found")
            
            return self.tasks[task_id].copy()
    
    def cancel_task(self, task_id: str) -> bool:
        """
        Cancel a task if it's still pending
        
        Args:
            task_id: Task identifier
            
        Returns:
            True if task was cancelled, False otherwise
        """
        with self._lock:
            if task_id not in self.tasks:
                raise ValueError(f"Task {task_id} not found")
            
            if self.tasks[task_id]["status"] == "pending":
                self.tasks[task_id]["status"] = "cancelled"
                self.tasks[task_id]["completed_at"] = time.time()
                logger.info(f"Task {task_id} cancelled")
                return True
            
            return False
    
    def list_tasks(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all tasks, optionally filtered by status
        
        Args:
            status: Filter tasks by status
            
        Returns:
            List of task info dictionaries
        """
        with self._lock:
            if status:
                return [task.copy() for task in self.tasks.values() if task["status"] == status]
            return [task.copy() for task in self.tasks.values()]
    
    def cleanup_completed_tasks(self, max_age_seconds: int = 3600) -> int:
        """
        Remove completed, failed, or cancelled tasks older than max_age_seconds
        
        Args:
            max_age_seconds: Maximum age in seconds
            
        Returns:
            Number of tasks removed
        """
        current_time = time.time()
        removable_statuses = ["completed", "failed", "cancelled"]
        task_ids_to_remove = []
        
        with self._lock:
            for task_id, task in self.tasks.items():
                if task["status"] in removable_statuses:
                    if task["completed_at"] and (current_time - task["completed_at"]) > max_age_seconds:
                        task_ids_to_remove.append(task_id)
        
            for task_id in task_ids_to_remove:
                del self.tasks[task_id]
        
        if task_ids_to_remove:
            logger.info(f"Cleaned up {len(task_ids_to_remove)} old tasks")
        
        return len(task_ids_to_remove)


# Create singleton instance
task_manager = BackgroundTaskManager() 